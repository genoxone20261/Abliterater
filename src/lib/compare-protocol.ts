/** C-004/C-005 comparison design. Empty cells are unmeasured — not a run. */

export const COMPARE_SUBJECTS = [
  "abliterater-ssh",
  "skypilot",
  "dstack",
  "runpod-console",
] as const;

export const COMPARE_SETUP_AXES = ["setup_minutes", "input_count", "recovery_steps"] as const;

export const COMPARE_PERF_AXES = [
  "same_gpu",
  "same_model_revision",
  "same_dataset_revision",
  "same_seed",
  "same_precision",
  "wall_time",
  "total_cost",
  "error_rate",
  "artifact_checksum",
] as const;

export type CompareEvidence = "unmeasured";

export type CompareCell = { value: null; evidence: CompareEvidence };

export function emptyCompareMatrix(): Record<
  (typeof COMPARE_SUBJECTS)[number],
  Record<(typeof COMPARE_SETUP_AXES)[number] | (typeof COMPARE_PERF_AXES)[number], CompareCell>
> {
  const axes = [...COMPARE_SETUP_AXES, ...COMPARE_PERF_AXES];
  const matrix = {} as ReturnType<typeof emptyCompareMatrix>;
  for (const subject of COMPARE_SUBJECTS) {
    matrix[subject] = {} as (typeof matrix)[typeof subject];
    for (const axis of axes) {
      matrix[subject][axis] = { value: null, evidence: "unmeasured" };
    }
  }
  return matrix;
}
