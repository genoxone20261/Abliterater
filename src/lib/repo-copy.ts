export type RepoLocale = "ko" | "en";

export const REPO_SLUG: Record<string, string> = {
  "p-e-w/heretic": "heretic",
  "elder-plinius/OBLITERATUS": "obliteratus",
  "andyrdt/refusal_direction": "refusal_direction",
  "ant-research/Awesome-Refusal-Suppression": "awesome_refusal",
  "FailSpy/abliterator": "failspy",
  "Goekdeniz-Guelmez/gabliteration": "gabliteration",
  "heterodoxin/apostate": "apostate",
  "wuwangzhang1216/abliterix": "abliterix",
  "AIAnytime/ablate": "ablate",
  "jwest33/abliterator": "jwest",
  "nanofatdog/LLM-abliterate": "llmabliterate",
  "josepha-mayo/model-unfetter": "unfetter",
  "NousResearch/llm-abliteration": "nous",
  "AUGMXNT/deccp": "deccp",
  "mlabonne/abliteration (HF blog)": "mlabonne",
  TransformerLens: "transformer_lens",
  "Tsadoq/ErisForge": "erisforge",
  "Orion-zhen/abliteration": "orion",
  "elder-plinius/OBLITERATUS (pinned fork)": "obliteratus_pinned",
  "mainlp/False-Refusal-Mitigation": "false_refusal",
  "ricyoung/abliteration-comparison": "comparison",
  "GraySwanAI/circuit-breakers": "circuit_breakers",
  "wollschlager/geometry-of-refusal": "geometry",
  "knoveleng/orthex": "orthex",
  "FiditeNemini/mlx-abliteration": "mlx",
  "knol3j/cli-abliterated": "cli_abliterated",
  "0x0806/UnleashedLLM": "unleashed",
  "adybag14-cyber/Abliteration": "handbook",
};

export const REPO = {
  ko: {
    heretic_role: "기본 도구",
    heretic_use:
      "TPE 최적화 직교화. pip install git+https://github.com/p-e-w/heretic.git@3521f8648a0dccf6e12a92666862632235fac7e6",
    obliteratus_role: "헤드리스 ablation CLI",
    obliteratus_use:
      "pip install git+https://github.com/elder-plinius/OBLITERATUS.git@205d28a11352313eb68954223948c9ce9b10cb39 · obliteratus obliterate --method advanced. argparse에 failspy 없음.",
    refusal_direction_role: "논문 공식 코드",
    refusal_direction_use: "Arditi 재현. r을 직접 그릴 때",
    awesome_refusal_role: "인덱스",
    awesome_refusal_use: "논문·리포 목록의 출발점",
    failspy_role: "원조 실용",
    failspy_use: "초기 표준. 호환은 좁음. console script 없음. analog apply_ablation.py.",
    gabliteration_role: "연구 코드",
    gabliteration_use: "다방향·ridge 재현. gabliterate @1498fc74. stdin 1은 analog.",
    apostate_role: "MIT KCRN/diode CLI",
    apostate_use:
      "console script apostate. apostate ablate --model --out @be36269d (2026-09-07). PyPI 404. 선택 칩.",
    abliterix_role: "2026 Heretic 파생",
    abliterix_use:
      "선택 칩. pip git @5d58cea9 (2026-09-01). --model.model-id --non-interactive --non-interactive-output-dir. vendor 금지.",
    ablate_role: "MIT 무인 CLI",
    ablate_use:
      "선택 칩. console script ablate. git @6b89bea10dd2305b374004147ccc2b3a16769c38 = ablate-llm 0.2.0. ablate run --model --output --save-model. bake는 output/model.",
    jwest_role: "MIT 직교 투영 CLI",
    jwest_use:
      "선택 칩. console script abliterate. FailSpy 아님. git @6ca3356e. --batch --model_path --output_path (underscore). PyPI abliterator 404. pip abliteration 금지.",
    llmabliterate_role: "Apache 무인 extract/apply CLI",
    llmabliterate_use:
      "선택 칩. console script llm-abliterate @f01cec96. alias abliterate 금지(jwest). extract --out; apply --direction --lam 1.65 --save. LICENSE 파일 404, pyproject Apache-2.0.",
    unfetter_role: "Apache 무인 ablate CLI",
    unfetter_use:
      "선택 칩. console script unfetter @4c9548c2. unfetter ablate MODEL --output --backend gpu. --strength 파서 기본 1.0. setup.py entry_points.",
    nous_role: "Transformers",
    nous_use: "빠른 교육용 파이프라인. vendor 금지.",
    deccp_role: "단일 패스",
    deccp_use: "능력 보존 비교 실험. 01/03 파일명 @1a6d5571. deccp 명령 없음.",
    mlabonne_role: "입문 글",
    mlabonne_use: "초보 진입. 2024-06 해설",
    transformer_lens_role: "해석",
    transformer_lens_use: "훅·캐시·패치. FailSpy 노트북 의존. 포트 안 함.",
    erisforge_role: "레이어 래퍼",
    erisforge_use: "레이어 래퍼 라이브러리. console script 없음. analog apply_ablation.py.",
    orion_role: "YAML 단일패스",
    orion_use: "python abliterate.py config.yaml. vendor 금지.",
    obliteratus_pinned_role: "GUI·다중전략 (pinned)",
    obliteratus_pinned_use:
      "팩 git @fb38a3b0. HEAD 2026-08-30 ls-remote cd8b0b78 드리프트, 재핀 안 함. vendor 금지.",
    false_refusal_role: "과잉거절만",
    false_refusal_use: "거짓 거절 벡터. 전 범주 아님",
    comparison_role: "벤치",
    comparison_use: "4도구 호환·GSM8K 표",
    circuit_breakers_role: "방어",
    circuit_breakers_use: "ablation의 거울. 유해 궤적 차단",
    geometry_role: "원뿔",
    geometry_use: "다차원 거절 기하 재현",
    orthex_role: "MIT --config CLI",
    orthex_use:
      "console script orthex 있음. --config required. configs/data 휠 밖, architecture_adapter 필수. 칩 아님.",
    mlx_role: "Apple MLX 스크립트",
    mlx_use: "python cli.py argparse. console script 없음. MLX-only. CUDA 팩 칩 아님.",
    cli_abliterated_role: "GGUF 채팅",
    cli_abliterated_use: "cli-abliterated 콘솔 스크립트는 채팅. ablation 아님.",
    unleashed_role: "다운로더/채팅",
    unleashed_use: "Unleashed 라벨. ablation CLI 없음. analog 칩 발명 금지.",
    handbook_role: "핸드북",
    handbook_use: "문서+abliterate-cxx 릴리스. pip console script 없음. 칩 아님.",
  },
  en: {
    heretic_role: "Default tool",
    heretic_use:
      "TPE-optimized orthogonalization. pip install git+https://github.com/p-e-w/heretic.git@3521f8648a0dccf6e12a92666862632235fac7e6",
    obliteratus_role: "Headless ablation CLI",
    obliteratus_use:
      "pip install git+https://github.com/elder-plinius/OBLITERATUS.git@205d28a11352313eb68954223948c9ce9b10cb39 · obliteratus obliterate --method advanced. argparse has no failspy.",
    refusal_direction_role: "Official paper code",
    refusal_direction_use: "Reproduce Arditi. When drawing r directly.",
    awesome_refusal_role: "Index",
    awesome_refusal_use: "Starting point for papers and repos.",
    failspy_role: "Original practical",
    failspy_use:
      "Early standard. Narrow compatibility. No console script. analog apply_ablation.py.",
    gabliteration_role: "Research code",
    gabliteration_use:
      "Multi-direction + ridge reproduce. gabliterate @1498fc74. stdin 1 is analog.",
    apostate_role: "MIT KCRN/diode CLI",
    apostate_use:
      "console script apostate. apostate ablate --model --out @be36269d (2026-09-07). PyPI 404. Optional chip.",
    abliterix_role: "2026 Heretic fork",
    abliterix_use:
      "Optional chip. pip git @5d58cea9 (2026-09-01). --model.model-id --non-interactive --non-interactive-output-dir. Do not vendor.",
    ablate_role: "MIT unattended CLI",
    ablate_use:
      "Optional chip. console script ablate. git @6b89bea10dd2305b374004147ccc2b3a16769c38 = ablate-llm 0.2.0. ablate run --model --output --save-model. bake is output/model.",
    jwest_role: "MIT orthogonal-projection CLI",
    jwest_use:
      "Optional chip. console script abliterate. Not FailSpy. git @6ca3356e. --batch --model_path --output_path (underscore). PyPI abliterator 404. Do not pip abliteration.",
    llmabliterate_role: "Apache unattended extract/apply CLI",
    llmabliterate_use:
      "Optional chip. console script llm-abliterate @f01cec96. Do not alias abliterate (jwest). extract --out; apply --direction --lam 1.65 --save. LICENSE file 404, pyproject Apache-2.0.",
    unfetter_role: "Apache unattended ablate CLI",
    unfetter_use:
      "Optional chip. console script unfetter @4c9548c2. unfetter ablate MODEL --output --backend gpu. --strength parser default 1.0. setup.py entry_points.",
    nous_role: "Transformers",
    nous_use: "Fast teaching pipeline. Do not vendor.",
    deccp_role: "Single pass",
    deccp_use: "Capability-preserving compare. 01/03 filenames @1a6d5571. No deccp command.",
    mlabonne_role: "Intro article",
    mlabonne_use: "Beginner entry. 2024-06 explainer.",
    transformer_lens_role: "Interpretability",
    transformer_lens_use: "Hooks, cache, patch. FailSpy notebook dependency. Do not port.",
    erisforge_role: "Layer wrapper",
    erisforge_use: "Layer-wrapper library. No console script. analog apply_ablation.py.",
    orion_role: "YAML single-pass",
    orion_use: "python abliterate.py config.yaml. Do not vendor.",
    obliteratus_pinned_role: "GUI + multi-strategy (pinned)",
    obliteratus_pinned_use:
      "Pack git @fb38a3b0. HEAD 2026-08-30 ls-remote cd8b0b78 drift; do not re-pin. Do not vendor.",
    false_refusal_role: "Over-refusal only",
    false_refusal_use: "False-refusal vector. Not all categories.",
    comparison_role: "Bench",
    comparison_use: "4-tool compatibility + GSM8K table.",
    circuit_breakers_role: "Defense",
    circuit_breakers_use: "Mirror of ablation. Blocks harmful trajectories.",
    geometry_role: "Cone",
    geometry_use: "Reproduce multi-d refusal geometry.",
    orthex_role: "MIT --config CLI",
    orthex_use:
      "Has console script orthex. --config required. configs/data outside the wheel; architecture_adapter required. Not a chip.",
    mlx_role: "Apple MLX script",
    mlx_use: "python cli.py argparse. No console script. MLX-only. Not a CUDA pack chip.",
    cli_abliterated_role: "GGUF chat",
    cli_abliterated_use: "cli-abliterated console script is chat. Not ablation.",
    unleashed_role: "Downloader / chat",
    unleashed_use: "Unleashed label. No ablation CLI. Do not invent analog chips.",
    handbook_role: "Handbook",
    handbook_use: "Docs + abliterate-cxx release. No pip console script. Not a chip.",
  },
} as const;

export function repoCopy(
  name: string,
  field: "role" | "use",
  fallback: string,
  locale: RepoLocale = "ko",
): string {
  const slug = REPO_SLUG[name];
  if (!slug) return fallback;
  const key = `${slug}_${field}`;
  const table = REPO[locale] as Record<string, string>;
  return table[key] ?? (REPO.ko as Record<string, string>)[key] ?? fallback;
}
