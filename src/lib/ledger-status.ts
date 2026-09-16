/** Four-ledger remaining-work parser. analog ≠ native. Never emit a cross-ledger sum. */

export type LedgerName = "roadmap-01-20" | "r-workload" | "workflow-w" | "ecosystem";

export type RoadmapReport = {
  ids: string[];
  remainingNative: string[];
  analogImplemented: string[];
};

export type WorkloadRReport = {
  ids: string[];
  remainingGpu: string[];
  remainingInAppLive: string[];
  analogImplemented: string[];
};

export type WorkflowWReport = {
  ids: string[];
  remainingTableOpen: string[];
  analogImplemented: string[];
};

export type EcosystemReport = {
  remainingUnchecked: string[];
  remainingTableOpen: string[];
  closed: string[];
};

export type LedgerReport = {
  neverSum: true;
  ledgers: {
    "roadmap-01-20": RoadmapReport;
    "r-workload": WorkloadRReport;
    "workflow-w": WorkflowWReport;
    ecosystem: EcosystemReport;
  };
};

function cells(line: string): string[] {
  const raw = line.trim();
  if (!raw.startsWith("|")) return [];
  return raw
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

function hasOpen(text: string): boolean {
  return /\bOPEN\b/i.test(text);
}

export function parseRoadmap(md: string): RoadmapReport {
  const ids: string[] = [];
  const remainingNative: string[] = [];
  const analogImplemented: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    const cols = cells(line);
    if (cols.length < 11) continue;
    const id = cols[0]?.match(/^(\d{2})\b/)?.[1];
    if (!id) continue;
    ids.push(id);
    const verification = cols[9] ?? "";
    const status = cols[10] ?? "";
    if (/IMPLEMENTED/i.test(status)) analogImplemented.push(id);
    if (hasOpen(`${verification} ${status}`)) remainingNative.push(id);
  }
  return { ids, remainingNative, analogImplemented };
}

export function parseWorkloadR(md: string): WorkloadRReport {
  const ids: string[] = [];
  const remainingGpu: string[] = [];
  const remainingInAppLive: string[] = [];
  const analogImplemented: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    const cols = cells(line);
    if (cols.length < 3) continue;
    const id = cols[0]?.match(/\*{0,2}(R-\d+)\*{0,2}/)?.[1];
    if (!id) continue;
    ids.push(id);
    const joined = cols.join(" ");
    if (/IMPLEMENTED analog/i.test(joined)) analogImplemented.push(id);
    if (/\bE01\b/.test(joined) || (/GPU/i.test(cols[1] ?? "") && hasOpen(joined))) {
      if (hasOpen(joined) && /E01|파이프 실측|QLoRA 7B 실측/.test(joined)) remainingGpu.push(id);
    }
    if (/in-app/.test(joined) && /실시간/.test(joined) && hasOpen(joined))
      remainingInAppLive.push(id);
  }
  return { ids, remainingGpu, remainingInAppLive, analogImplemented };
}

export function parseWorkflowW(md: string): WorkflowWReport {
  const ids: string[] = [];
  const remainingTableOpen: string[] = [];
  const analogImplemented: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    const cols = cells(line);
    if (cols.length < 2) continue;
    const id = cols[0]?.match(/^(W\d+)/)?.[1];
    if (!id) continue;
    ids.push(id);
    const status = cols[cols.length - 1] ?? "";
    if (/IMPLEMENTED analog/i.test(status)) analogImplemented.push(id);
    else remainingTableOpen.push(id);
  }
  return { ids, remainingTableOpen, analogImplemented };
}

export function parseEcosystem(md: string): EcosystemReport {
  const remainingUnchecked: string[] = [];
  const remainingTableOpen: string[] = [];
  const closed: string[] = [];
  for (const line of md.split(/\r?\n/)) {
    const box = line.match(/^- \[([ xX])\] ([A-Z]+-\d+)/);
    if (box) {
      if (box[1] === " ") remainingUnchecked.push(box[2]);
      else closed.push(box[2]);
      continue;
    }
    const cols = cells(line);
    if (cols.length < 5) continue;
    const id = cols[0]?.match(/^(C-\d+)$/)?.[1];
    if (!id) continue;
    const status = cols[cols.length - 1] ?? "";
    if (hasOpen(status)) remainingTableOpen.push(id);
    else if (/IMPLEMENTED/i.test(status)) closed.push(id);
  }
  return { remainingUnchecked, remainingTableOpen, closed };
}

export function reportLedgers(docs: {
  roadmap: string;
  workload: string;
  workflow: string;
  ecosystem: string;
}): LedgerReport {
  return {
    neverSum: true,
    ledgers: {
      "roadmap-01-20": parseRoadmap(docs.roadmap),
      "r-workload": parseWorkloadR(docs.workload),
      "workflow-w": parseWorkflowW(docs.workflow),
      ecosystem: parseEcosystem(docs.ecosystem),
    },
  };
}

export function formatLedgerReport(report: LedgerReport): string {
  const r = report.ledgers;
  const lines = [
    "원장별 잔여 (합산 금지). analog IMPLEMENTED ≠ native.",
    "",
    `01–20 native OPEN: ${r["roadmap-01-20"].remainingNative.join(", ") || "(없음)"}`,
    `01–20 analog IMPLEMENTED: ${r["roadmap-01-20"].analogImplemented.length} ids (not a close of native OPEN)`,
    "",
    `R GPU OPEN: ${r["r-workload"].remainingGpu.join(", ") || "(없음)"}`,
    `R in-app live OPEN: ${r["r-workload"].remainingInAppLive.join(", ") || "(없음)"}`,
    `R analog IMPLEMENTED: ${r["r-workload"].analogImplemented.join(", ") || "(없음)"}`,
    "",
    `W 표 OPEN: ${r["workflow-w"].remainingTableOpen.join(", ") || "(없음)"}`,
    `W analog IMPLEMENTED: ${r["workflow-w"].analogImplemented.join(", ") || "(없음)"}`,
    "",
    `에코 unchecked: ${r.ecosystem.remainingUnchecked.join(", ") || "(없음)"}`,
    `에코 표 OPEN: ${r.ecosystem.remainingTableOpen.join(", ") || "(없음)"}`,
    `에코 closed: ${r.ecosystem.closed.join(", ") || "(없음)"}`,
  ];
  return lines.join("\n");
}
