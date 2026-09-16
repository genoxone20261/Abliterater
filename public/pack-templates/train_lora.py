#!/usr/bin/env python3
"""LoRA SFT trainer. Invoked as `accelerate launch train_lora.py` or `python train_lora.py`."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import torch
from datasets import Dataset
from peft import LoraConfig, PeftModel, get_peft_model
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="LoRA SFT for Abliterater packs")
    p.add_argument("--base", required=True, help="HF dir or repo of the base model")
    p.add_argument("--data", required=True, help="jsonl/json file or directory")
    p.add_argument("--out", default="", help="adapter directory (alias of --output_dir)")
    p.add_argument("--system", default="", help="system prompt text or path to a text file")
    p.add_argument("--lora_r", type=int, default=16)
    p.add_argument("--lora_alpha", type=int, default=32)
    p.add_argument("--lr", type=float, default=0.0002)
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--output_dir", default="", help="adapter directory")
    p.add_argument("--max_len", type=int, default=2048)
    return p.parse_args()


def read_system(system: str) -> str:
    if not system:
        return ""
    path = Path(system)
    if path.is_file():
        return path.read_text(encoding="utf-8").strip()
    return system.strip()


def iter_jsonl(path: Path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".json" and text.lstrip().startswith("["):
        data = json.loads(text)
        if not isinstance(data, list):
            raise SystemExit("JSON array expected in %s" % path)
        for row in data:
            yield row
        return
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        yield json.loads(line)


def collect_rows(data_path: Path) -> list:
    files: list[Path] = []
    if data_path.is_file():
        files = [data_path]
    elif data_path.is_dir():
        files = sorted(data_path.rglob("*.jsonl")) + sorted(data_path.rglob("*.json"))
    if not files:
        raise SystemExit("no json/jsonl under %s" % data_path)
    rows = []
    for f in files:
        for row in iter_jsonl(f):
            if isinstance(row, dict):
                rows.append(row)
    if not rows:
        raise SystemExit("no records in %s" % data_path)
    return rows


def row_to_messages(row: dict, system: str) -> list:
    if isinstance(row.get("messages"), list) and row["messages"]:
        msgs = [m for m in row["messages"] if isinstance(m, dict) and "role" in m]
        if system and not any(m.get("role") == "system" for m in msgs):
            return [{"role": "system", "content": system}] + msgs
        return msgs
    instruction = str(row.get("instruction") or row.get("prompt") or "")
    user_in = str(row.get("input") or "")
    output = str(row.get("output") or row.get("response") or row.get("completion") or "")
    if not output:
        chosen = row.get("chosen")
        if isinstance(chosen, str):
            output = chosen
        elif isinstance(chosen, dict):
            output = str(chosen.get("content") or "")
    if instruction or output:
        user = instruction if not user_in else "%s\n%s" % (instruction, user_in)
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": user})
        if output:
            msgs.append({"role": "assistant", "content": output})
        return msgs
    text = str(row.get("text") or "")
    if not text:
        raise SystemExit("unsupported row keys: %s" % sorted(row.keys()))
    if system:
        return [{"role": "system", "content": system}, {"role": "user", "content": text}]
    return [{"role": "user", "content": text}]


def render(tokenizer, messages: list) -> str:
    if hasattr(tokenizer, "apply_chat_template"):
        try:
            return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        except Exception:
            pass
    parts = []
    for m in messages:
        parts.append("%s: %s" % (m.get("role", "user"), m.get("content", "")))
    return "\n".join(parts)


def pick_targets(model) -> list:
    names = set()
    for n, mod in model.named_modules():
        w = getattr(mod, "weight", None)
        if w is not None and getattr(w, "ndim", 0) == 2:
            names.add(n.split(".")[-1])
    preferred = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    hit = [x for x in preferred if x in names]
    if hit:
        return hit
    alt = ["query", "key", "value", "dense", "fc1", "fc2", "c_attn", "c_proj"]
    hit = [x for x in alt if x in names]
    if hit:
        return hit
    raise SystemExit("no LoRA target modules; saw %s" % sorted(names)[:40])


def load_model(base: str):
    cuda = torch.cuda.is_available()
    tok = AutoTokenizer.from_pretrained(base, use_fast=True, trust_remote_code=True)
    if tok.pad_token is None:
        tok.pad_token = tok.eos_token
    kw = {"trust_remote_code": True}
    bnb = None
    if cuda:
        try:
            from transformers import BitsAndBytesConfig
            from peft import prepare_model_for_kbit_training

            compute = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
            bnb = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=compute,
            )
            model = AutoModelForCausalLM.from_pretrained(
                base, quantization_config=bnb, device_map="auto", **kw
            )
            model = prepare_model_for_kbit_training(model)
            return tok, model, cuda
        except Exception:
            bnb = None
    dtype = torch.float32
    if cuda and torch.cuda.is_bf16_supported():
        dtype = torch.bfloat16
    elif cuda:
        dtype = torch.float16
    model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=dtype, **kw)
    if cuda:
        model = model.cuda()
    return tok, model, cuda


def maybe_freeze_router(model) -> None:
    if os.environ.get("DSMOE_FREEZE_ROUTER") != "1":
        return
    for n, p in model.named_parameters():
        low = n.lower()
        if "router" in low or ".gate." in low or low.endswith(".gate"):
            p.requires_grad = False


def main() -> None:
    args = parse_args()
    out_dir = args.output_dir or args.out or "./adapter"
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    system = read_system(args.system)
    rows = collect_rows(Path(args.data))
    tok, model, cuda = load_model(args.base)
    targets = pick_targets(model)
    lora = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=targets,
    )
    model = get_peft_model(model, lora)
    maybe_freeze_router(model)
    texts = [render(tok, row_to_messages(row, system)) for row in rows]
    ds = Dataset.from_dict({"text": texts})

    def tokenize(batch):
        return tok(batch["text"], truncation=True, max_length=args.max_len, padding=False)

    ds = ds.map(tokenize, batched=True, remove_columns=["text"])
    use_bf16 = cuda and torch.cuda.is_bf16_supported()
    use_fp16 = cuda and not use_bf16
    targs = TrainingArguments(
        output_dir=out_dir,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=8,
        logging_steps=5,
        save_strategy="epoch",
        bf16=use_bf16,
        fp16=use_fp16,
        report_to=[],
        remove_unused_columns=False,
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
    )
    collator = DataCollatorForLanguageModeling(tok, mlm=False)
    trainer = Trainer(model=model, args=targs, train_dataset=ds, data_collator=collator)
    trainer.train()
    model.save_pretrained(out_dir)
    tok.save_pretrained(out_dir)
    if os.environ.get("MERGE_LORA") == "1":
        merge_dir = os.environ.get("MERGE_DIR", "./merged")
        Path(merge_dir).mkdir(parents=True, exist_ok=True)
        base = AutoModelForCausalLM.from_pretrained(
            args.base, torch_dtype=torch.float32, trust_remote_code=True
        )
        merged = PeftModel.from_pretrained(base, out_dir)
        merged = merged.merge_and_unload()
        merged.save_pretrained(merge_dir)
        tok.save_pretrained(merge_dir)
    print("saved adapter to %s" % out_dir)


if __name__ == "__main__":
    main()
