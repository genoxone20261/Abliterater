#!/usr/bin/env bash
set -euo pipefail
SRC="${1:-${SRC:-./base}}"
QUANT="${2:-${QUANT:-Q4_K_M}}"
CTX="${3:-${CTX:-4096}}"
DO_IMATRIX="${4:-${DO_IMATRIX:-0}}"
if command -v python3 >/dev/null 2>&1; then PY=python3; else PY=python; fi
if command -v nproc >/dev/null 2>&1; then JOBS="$(nproc)"; else JOBS="$(getconf _NPROCESSORS_ONLN 2>/dev/null || printf '%s' 4)"; fi
export CMAKE_ARGS="${CMAKE_ARGS:--DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS}"
if [ ! -d llama.cpp/.git ]; then
  git clone --depth 1 https://github.com/ggml-org/llama.cpp llama.cpp
fi
cmake -S llama.cpp -B llama.cpp/build -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS
cmake --build llama.cpp/build --config Release -j "${JOBS}"
CONVERT=""
if [ -f llama.cpp/convert_hf_to_gguf.py ]; then
  CONVERT="llama.cpp/convert_hf_to_gguf.py"
elif [ -f llama.cpp/convert-hf-to-gguf.py ]; then
  CONVERT="llama.cpp/convert-hf-to-gguf.py"
else
  printf '%s\n' "llama.cpp convert script missing" >&2
  exit 1
fi
"$PY" "${CONVERT}" "${SRC}" --outfile ./model-f16.gguf --outtype f16
QBIN=""
while IFS= read -r f; do
  QBIN=$f
  break
done < <(find llama.cpp/build -type f \( -name llama-quantize -o -name llama-quantize.exe \))
if [ -z "${QBIN}" ]; then
  printf '%s\n' "llama-quantize not found under llama.cpp/build" >&2
  exit 1
fi
if [ "${DO_IMATRIX}" = "1" ]; then
  if [ ! -f ./imatrix-cal.txt ]; then
    "$PY" - <<'PY'
from pathlib import Path
Path("imatrix-cal.txt").write_text(
    "\n".join([
        "Solve 17 * 24 and show the steps.",
        "Prove that the square root of 2 is irrational.",
        "Write a Python function that merges two sorted lists.",
        "Explain residual connections in a transformer block.",
        "Convert 3.5 km/h to m/s and keep SI units.",
        "List the steps to rotate a 3D vector by a quaternion.",
        "Differentiate x^3 * sin(x) with the product rule.",
        "Describe how OpenBLAS GEMM uses CPU cache tiles.",
    ]) + "\n",
    encoding="utf-8",
)
PY
  fi
  IBIN=""
  while IFS= read -r f; do
    IBIN=$f
    break
  done < <(find llama.cpp/build -type f \( -name llama-imatrix -o -name llama-imatrix.exe \))
  if [ -n "${IBIN}" ]; then
    "${IBIN}" -m ./model-f16.gguf -f ./imatrix-cal.txt -o ./imatrix.dat -c "${CTX}"
    "${QBIN}" --imatrix ./imatrix.dat ./model-f16.gguf "./model.${QUANT}.gguf" "${QUANT}"
  else
    printf '%s\n' "llama-imatrix missing; falling back to plain quantize"
    "${QBIN}" ./model-f16.gguf "./model.${QUANT}.gguf" "${QUANT}"
  fi
else
  "${QBIN}" ./model-f16.gguf "./model.${QUANT}.gguf" "${QUANT}"
fi
printf '%s\n' "wrote ./model.${QUANT}.gguf"
