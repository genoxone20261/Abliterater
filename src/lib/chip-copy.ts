export type ChipLocale = "ko" | "en";
export const CHIP = {
  ko: {
    purpose_uncensored_title: "Uncensored",
    purpose_uncensored_blurb: "거절을 학습으로 줄인 채팅 모델. Dolphin·Mythos류 SFT.",
    purpose_abliterated_title: "Abliterated",
    purpose_abliterated_blurb: "가중치에서 거절 방향을 뺀다. Heretic / FailSpy / Gabliteration.",
    purpose_domain_title: "분야 전용",
    purpose_domain_blurb:
      "수학·물리·공학·생물·사이버 등. RAG → LoRA → (선택) 범주 ablation → 양자화.",
    purpose_pipeline_title: "풀 파이프라인",
    purpose_pipeline_blurb: "원본 → 평가 → (SFT/ablation) → 양자화 → 카드 게시까지 한 작업.",

    domain_general_title: "일반 채팅",
    domain_general_note: "검열 톤을 제거한 범용 조수.",
    domain_math_title: "수학",
    domain_math_note: "증명·계산 밀도. ablation은 거절만, 실력 대체 아님.",
    domain_physics_title: "물리학",
    domain_physics_note: "단위·유도. 전용 unc 카드는 드묾.",
    domain_engineering_title: "공학·코드",
    domain_engineering_note: "동작하는 패치와 명령.",
    domain_biology_title: "생물학",
    domain_biology_note: "메커니즘·문헌. 임상 코스프레 없음.",
    domain_biotech_title: "생명공학",
    domain_biotech_note: "공정·서열. ESM과 LLM 분리.",
    domain_cyber_red_title: "사이버 레드",
    domain_cyber_red_note: "인가 가정. 기법을 생략 없이.",
    domain_cyber_blue_title: "사이버 블루",
    domain_cyber_blue_note: "탐지·대응. 공격 기법을 알아야 막음.",
    domain_military_title: "군사(연구)",
    domain_military_note: "공개 교리·군사학. 개론 회피 없음.",

    method_heretic_title: "Heretic",
    method_heretic_blurb:
      "Optuna TPE 직교화. 호환 16/16. PyPI 1.4.0은 unattended save 없음. git @3521f86 (2026-09-05).",
    method_obliteratus_title: "OBLITERATUS",
    method_obliteratus_blurb:
      "Pliny CLI. native: obliteratus obliterate --method advanced. git @205d28a1. AGPL. GPU 전용.",
    method_failspy_title: "FailSpy abliterator",
    method_failspy_blurb:
      "원조 캐시 방식. 호환 좁음. 이 팩은 upstream CLI 대신 apply_ablation.py를 사용.",
    method_deccp_title: "DECCP",
    method_deccp_blurb:
      "빠른 투영. GSM8K 덜 깨짐. 호환 11/16. native wiring: 01/03 @1a6d5571. MODEL_ID를 base로 치환(Apache 하네스). Qwen2 o_proj/down_proj는 그대로. GPU.",
    method_erisforge_title: "ErisForge",
    method_erisforge_blurb: "래퍼. 호환 9/16. 이 팩은 upstream CLI 대신 apply_ablation.py를 사용.",
    method_gabliteration_title: "Gabliteration",
    method_gabliteration_blurb:
      "SVD 다방향 + ridge. native CLI gabliterate @1498fc74. gabliterate_fast 없음. 선택 prompt는 stdin 1 (unattended analog). GPU.",
    method_apostate_title: "Apostate",
    method_apostate_blurb:
      "MIT CLI. apostate ablate --model --out. 기본 diode. git @be36269d. PyPI apostate 404. 선택 칩. GPU.",
    method_abliterix_title: "Abliterix",
    method_abliterix_blurb:
      "AGPL 선택 칩. 기본 경로 아님. abliterix --model.model-id --non-interactive. git @5d58cea9. vendor 금지. GPU.",
    method_ablate_title: "Ablate",
    method_ablate_blurb:
      "MIT CLI. ablate run --model --output --save-model. git @6b89bea = PyPI ablate-llm 0.2.0. 선택 칩. GPU.",
    method_jwest_title: "jwest Abliterator",
    method_jwest_blurb:
      "MIT CLI. FailSpy 아님. abliterate --batch --model_path --output_path. git @6ca3356e. 선택 칩. GPU.",
    method_jimplus_title: "jim-plus MPOA",
    method_jimplus_blurb:
      "GPL-3.0 clone pin (vendor 금지). measure --projected + sharded_ablate --normpreserve. git @ca6e223. GPU.",
    method_llmabliterate_title: "LLM-abliterate",
    method_llmabliterate_blurb:
      "Apache CLI. llm-abliterate extract/apply. git @f01cec96. alias abliterate 금지(jwest 동음). --lam 1.65는 README 예. 선택 칩. GPU.",
    method_unfetter_title: "Unfetter",
    method_unfetter_blurb:
      "Apache CLI. unfetter ablate --output --backend gpu. git @4c9548c2. --strength 파서 기본 1.0. 선택 칩. GPU.",
    method_cast_title: "CAST 스티어링",
    method_cast_blurb: "가중치 불변. 추론 때 방향만.",
    method_sft_unc_title: "Unc. SFT (Dolphin형)",
    method_sft_unc_blurb: "거절 적은 대화로 풀/LoRA 학습.",
    method_lora_dpo_title: "LoRA + DPO/ORPO",
    method_lora_dpo_blurb: "오답·거절 쌍만 선호 학습.",
    method_domain_ablate_title: "범주별 ablation",
    method_domain_ablate_blurb: "도메인 대조 쌍. 교차 유출 남음.",
    method_rag_first_title: "RAG만 (학습 생략)",
    method_rag_first_blurb: "평가 후 문헌으로 충분하면 학습하지 않음.",
    method_cpt_title: "CPT 계속 사전학습",
    method_cpt_blurb: "Foundation-Sec류. 데이터·비용 큼.",
    method_dsmoe_title: "DSMoE / expert LoRA",
    method_dsmoe_blurb: "MoE 라우터 동결, 해당 expert만.",
    method_quant_title: "분야 imatrix 양자화",
    method_quant_blurb: "llama.cpp imatrix → GGUF.",
    method_exl2_title: "EXL2",
    method_exl2_blurb: "산출 칩. pin-call. 우리 GPU skip ≠ 제품 create:false.",
    method_awq_title: "AWQ / GPTQ",
    method_awq_blurb: "산출 칩. pin-call. 가중치 다운로드가 아님.",
    method_mergekit_title: "mergekit 병합",
    method_mergekit_blurb: "Apache pin-call. 두 HF 레포 → 병합 산출. vendor 금지.",
    method_eval_pack_title: "eval-pack",
    method_eval_pack_blurb: "학습 없이 거절 벤치 ZIP. analog ≠ 렌탈 n-trials.",

    store_local_title: "로컬 디스크",
    store_s3_title: "AWS S3",
    store_gcs_title: "Google Cloud Storage",
    store_azure_title: "Azure Blob",
    store_hf_title: "Hugging Face Hub",
    store_minio_title: "MinIO / S3호환 NAS",
    store_nfs_title: "NFS / SMB 공유",

    output_sft_adapter_title: "LoRA 어댑터만",
    output_merged_bf16_title: "병합 BF16 / FP16",
    output_gguf_q4_title: "GGUF Q4_K_M",
    output_gguf_q5_title: "GGUF Q5_K_M",
    output_gguf_q8_title: "GGUF Q8_0",
    output_ollama_title: "Ollama Modelfile",
    output_hf_private_title: "HF private 카드",
    output_onnx_title: "ONNX Runtime",
    output_openvino_title: "OpenVINO",
    output_docker_title: "Docker Compose 스택",

    gpu_multi_title: "멀티 GPU / 클러스터",
  },
  en: {
    purpose_uncensored_title: "Uncensored",
    purpose_uncensored_blurb:
      "Chat model with refusals reduced by training. Dolphin/Mythos-style SFT.",
    purpose_abliterated_title: "Abliterated",
    purpose_abliterated_blurb:
      "Subtract the refusal direction from weights. Heretic / FailSpy / Gabliteration.",
    purpose_domain_title: "Domain-specific",
    purpose_domain_blurb:
      "Math, physics, engineering, biology, cyber. RAG → LoRA → (optional) category ablation → quant.",
    purpose_pipeline_title: "Full pipeline",
    purpose_pipeline_blurb: "Source → eval → (SFT/ablation) → quant → card publish in one job.",

    domain_general_title: "General chat",
    domain_general_note: "General assistant with censorship tone removed.",
    domain_math_title: "Math",
    domain_math_note:
      "Proof and calculation density. Ablation is refusal-only, not a skill substitute.",
    domain_physics_title: "Physics",
    domain_physics_note: "Units and derivations. Dedicated unc cards are rare.",
    domain_engineering_title: "Engineering & code",
    domain_engineering_note: "Working patches and commands.",
    domain_biology_title: "Biology",
    domain_biology_note: "Mechanisms and literature. No clinical cosplay.",
    domain_biotech_title: "Biotech",
    domain_biotech_note: "Process and sequence. Keep ESM separate from the LLM.",
    domain_cyber_red_title: "Cyber red",
    domain_cyber_red_note: "Authorized-scope assumption. Techniques without omission.",
    domain_cyber_blue_title: "Cyber blue",
    domain_cyber_blue_note: "Detect and respond. You block what you understand.",
    domain_military_title: "Military (research)",
    domain_military_note: "Open doctrine and military studies. No intro-level dodge.",

    method_heretic_title: "Heretic",
    method_heretic_blurb:
      "Optuna TPE orthogonalization. Compat 16/16. PyPI 1.4.0 has no unattended save. git @3521f86 (2026-09-05).",
    method_obliteratus_title: "OBLITERATUS",
    method_obliteratus_blurb:
      "Pliny CLI. native: obliteratus obliterate --method advanced. git @205d28a1. AGPL. GPU only.",
    method_failspy_title: "FailSpy abliterator",
    method_failspy_blurb:
      "Original cache method. Narrow compat. This pack uses apply_ablation.py, not upstream CLI.",
    method_deccp_title: "DECCP",
    method_deccp_blurb:
      "Fast projection. Less GSM8K damage. Compat 11/16. native wiring: 01/03 @1a6d5571. Replace MODEL_ID with base (Apache harness). Qwen2 o_proj/down_proj unchanged. GPU.",
    method_erisforge_title: "ErisForge",
    method_erisforge_blurb:
      "Wrapper. Compat 9/16. This pack uses apply_ablation.py, not upstream CLI.",
    method_gabliteration_title: "Gabliteration",
    method_gabliteration_blurb:
      "Multi-direction SVD + ridge. native CLI gabliterate @1498fc74. No gabliterate_fast. Optional prompt is stdin 1 (unattended analog). GPU.",
    method_apostate_title: "Apostate",
    method_apostate_blurb:
      "MIT CLI. apostate ablate --model --out. Default diode. git @be36269d. PyPI apostate 404. Optional chip. GPU.",
    method_abliterix_title: "Abliterix",
    method_abliterix_blurb:
      "AGPL optional chip. Not the default path. abliterix --model.model-id --non-interactive. git @5d58cea9. Do not vendor. GPU.",
    method_ablate_title: "Ablate",
    method_ablate_blurb:
      "MIT CLI. ablate run --model --output --save-model. git @6b89bea = PyPI ablate-llm 0.2.0. Optional chip. GPU.",
    method_jwest_title: "jwest Abliterator",
    method_jwest_blurb:
      "MIT CLI. Not FailSpy. abliterate --batch --model_path --output_path. git @6ca3356e. Optional chip. GPU.",
    method_jimplus_title: "jim-plus MPOA",
    method_jimplus_blurb:
      "GPL-3.0 clone pin (do not vendor). measure --projected + sharded_ablate --normpreserve. git @ca6e223. GPU.",
    method_llmabliterate_title: "LLM-abliterate",
    method_llmabliterate_blurb:
      "Apache CLI. llm-abliterate extract/apply. git @f01cec96. Do not alias abliterate (jwest homonym). --lam 1.65 is a README example. Optional chip. GPU.",
    method_unfetter_title: "Unfetter",
    method_unfetter_blurb:
      "Apache CLI. unfetter ablate --output --backend gpu. git @4c9548c2. --strength parser default 1.0. Optional chip. GPU.",
    method_cast_title: "CAST steering",
    method_cast_blurb: "Weights unchanged. Direction only at inference.",
    method_sft_unc_title: "Unc. SFT (Dolphin-style)",
    method_sft_unc_blurb: "Full/LoRA train on low-refusal dialogue.",
    method_lora_dpo_title: "LoRA + DPO/ORPO",
    method_lora_dpo_blurb: "Preference train on wrong/refusal pairs only.",
    method_domain_ablate_title: "Category ablation",
    method_domain_ablate_blurb: "Domain contrast pairs. Cross-domain spillover remains.",
    method_rag_first_title: "RAG only (skip train)",
    method_rag_first_blurb: "Skip training when literature after eval is enough.",
    method_cpt_title: "CPT continued pretrain",
    method_cpt_blurb: "Foundation-Sec class. Data and cost are large.",
    method_dsmoe_title: "DSMoE / expert LoRA",
    method_dsmoe_blurb: "Freeze the MoE router; train that expert only.",
    method_quant_title: "Domain imatrix quant",
    method_quant_blurb: "llama.cpp imatrix → GGUF.",
    method_exl2_title: "EXL2",
    method_exl2_blurb: "Output chip. Pin-call. Our GPU skip != product create:false.",
    method_awq_title: "AWQ / GPTQ",
    method_awq_blurb: "Output chip. Pin-call. Not a weight download.",
    method_mergekit_title: "mergekit merge",
    method_mergekit_blurb: "Apache pin-call. Two HF repos → merge artifact. Do not vendor.",
    method_eval_pack_title: "eval-pack",
    method_eval_pack_blurb: "Refusal bench ZIP without training. analog != rented n-trials.",

    store_local_title: "Local disk",
    store_s3_title: "AWS S3",
    store_gcs_title: "Google Cloud Storage",
    store_azure_title: "Azure Blob",
    store_hf_title: "Hugging Face Hub",
    store_minio_title: "MinIO / S3-compatible NAS",
    store_nfs_title: "NFS / SMB share",

    output_sft_adapter_title: "LoRA adapter only",
    output_merged_bf16_title: "Merged BF16 / FP16",
    output_gguf_q4_title: "GGUF Q4_K_M",
    output_gguf_q5_title: "GGUF Q5_K_M",
    output_gguf_q8_title: "GGUF Q8_0",
    output_ollama_title: "Ollama Modelfile",
    output_hf_private_title: "HF private card",
    output_onnx_title: "ONNX Runtime",
    output_openvino_title: "OpenVINO",
    output_docker_title: "Docker Compose stack",

    gpu_multi_title: "Multi-GPU / cluster",
  },
} as const;

export type ChipKey = keyof typeof CHIP.ko;

export function chipKey(kind: string, id: string, field: string): string {
  return `${kind}_${id.replace(/-/g, "_")}_${field}`;
}

export function chipCopy(
  kind: string,
  id: string,
  field: string,
  fallback: string,
  locale: ChipLocale = "ko",
): string {
  const key = chipKey(kind, id, field);
  const table = CHIP[locale] as Record<string, string>;
  return table[key] ?? (CHIP.ko as Record<string, string>)[key] ?? fallback;
}
