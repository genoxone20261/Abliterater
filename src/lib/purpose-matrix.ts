/** Purpose × domain × measure-language → method ids already in studio METHODS. */
export type MeasureLang = "en" | "ko" | "zh";
export type PurposeMatrixInput = {
  purpose: string;
  domain: string;
  measureLang?: MeasureLang;
};

export type PurposeMatrix = {
  methods: string[];
  notes: string[];
  measureLang: MeasureLang;
};

const CODING = new Set(["engineering", "cyber-red", "cyber-blue"]);
const STEM = new Set(["math", "physics"]);
const LIFE = new Set(["biology", "biotech"]);

export function purposeMatrix(input: PurposeMatrixInput): PurposeMatrix {
  const purpose = input.purpose || "abliterated";
  const domain = input.domain || "general";
  const measureLang: MeasureLang = input.measureLang ?? "en";
  const methods: string[] = [];
  const notes: string[] = [];

  notes.push("측정 언어 기본은 EN. KO 이중 측정 권장. ZH는 검열 방향(deccp)에만.");
  if (measureLang === "ko") notes.push("KO 프롬프트로 거절률을 EN과 같이 잰다.");
  if (measureLang === "zh") notes.push("ZH 검열만 deccp 계열. 범용 채팅 측정은 EN을 유지.");

  if (purpose === "uncensored") {
    methods.push("sft-unc", "lora-dpo", "quant");
    notes.push("거절 적은 대화 SFT. 가중치 방향 제거가 아님.");
  } else if (purpose === "domain") {
    if (domain === "engineering") {
      methods.push("lora-dpo", "quant");
      notes.push("코딩: ablation은 약하게. GSM8K/유닛 테스트로 실력 재측정.");
    } else if (STEM.has(domain)) {
      methods.push("rag-first", "quant");
      notes.push("수학·물리: 거절 ablation ≠ 실력. GSM8K를 다시 잰다.");
    } else if (LIFE.has(domain)) {
      methods.push("rag-first", "lora-dpo", "quant");
    } else {
      methods.push("domain-ablate", "lora-dpo", "quant");
    }
  } else if (purpose === "pipeline") {
    methods.push("heretic", "lora-dpo", "quant");
    notes.push("평가 → (SFT/ablation) → 양자화. 창작은 가볍게 ablate 후 LoRA.");
  } else {
    // abliterated
    if (measureLang === "zh") {
      methods.push("deccp", "quant");
    } else if (CODING.has(domain)) {
      methods.push("deccp", "quant");
      notes.push("코딩 도메인: MLP 방향을 약하게. GSM8K 하락을 별도 기록.");
    } else if (STEM.has(domain)) {
      methods.push("heretic", "quant");
      notes.push("수학: heretic 후 GSM8K. 실패하면 deccp 비교.");
    } else {
      methods.push("heretic", "quant");
    }
    notes.push("ErisForge는 analog apply_ablation — 기본 칩 아님. COSMIC watch는 방법 id 아님.");
  }

  return { methods: [...new Set(methods)], notes, measureLang };
}
