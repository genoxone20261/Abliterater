import { useMemo, useState } from "react";
import { GitBranch, Layers, MessageSquare, Puzzle, Save, Terminal } from "lucide-react";
import { PACK_DOWNLOAD_NAMES } from "@/lib/pack";
import { t, useLocale } from "@/lib/i18n";
import { Field } from "@/components/ui/Field";

export type RecipeSnap = {
  id: string;
  name: string;
  savedAt: number;
  purpose: string;
  domain: string;
  methods: string[];
  outputs: string[];
  compute: string;
};

const RECIPE_KEY = "ablit.recipes.v1";
const SLOT_KEY = "ablit.slots.v1";

type LocalSlot = { id: string; label: string; note: string };

function loadSlots(): LocalSlot[] {
  const fallback: LocalSlot[] = [
    { id: "s1", label: "s1", note: "" },
    { id: "s2", label: "s2", note: "" },
    { id: "s3", label: "s3", note: "" },
  ];
  if (typeof localStorage === "undefined") return fallback;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SLOT_KEY) ?? "[]");
    if (!Array.isArray(parsed) || parsed.length !== 3) return fallback;
    return parsed as LocalSlot[];
  } catch {
    return fallback;
  }
}

function loadRecipes(): RecipeSnap[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECIPE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RecipeSnap[]) : [];
  } catch {
    return [];
  }
}

function persistRecipes(rows: RecipeSnap[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(RECIPE_KEY, JSON.stringify(rows.slice(0, 24)));
  } catch {
    /* quota */
  }
}

type MethodChip = { id: string; title: string };

type FlowNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  kind: "stage" | "method" | "zip";
  warn?: boolean;
  on?: boolean;
};

export function AnalogSuite({
  purposeId,
  domainId,
  computeId,
  purposeTitle,
  domainTitle,
  computeTitle,
  fileCount,
  k3,
  methods,
  selectedIds,
  outputs,
  outputLabels,
  sh,
  files,
  onToggleMethod,
  onToggleOutput,
  onApply,
}: {
  purposeId: string;
  domainId: string;
  computeId: string;
  purposeTitle: string;
  domainTitle: string;
  computeTitle: string;
  fileCount: number;
  k3: boolean;
  methods: MethodChip[];
  selectedIds: string[];
  outputs: string[];
  outputLabels: { id: string; title: string }[];
  sh: string;
  files: Record<string, string>;
  onToggleMethod: (id: string) => void;
  onToggleOutput: (id: string) => void;
  onApply: (snap: RecipeSnap) => void;
}) {
  const [locale] = useLocale();
  const slotTitle = (id: string) =>
    id === "s1"
      ? t("as_slot_a", locale)
      : id === "s2"
        ? t("as_slot_b", locale)
        : id === "s3"
          ? t("as_slot_c", locale)
          : id;
  const [name, setName] = useState("");
  const [recipes, setRecipes] = useState<RecipeSnap[]>(() => loadRecipes());
  const [focus, setFocus] = useState<string>("zip");
  const [talk, setTalk] = useState<string>(PACK_DOWNLOAD_NAMES[0] ?? "README.txt");
  const [slots, setSlots] = useState<LocalSlot[]>(() => loadSlots());

  const picked = methods.filter((m) => selectedIds.includes(m.id));
  const nodes = useMemo(() => {
    const list: FlowNode[] = [
      {
        id: "purpose",
        label: t("as_purpose", locale),
        sub: purposeTitle,
        x: 28,
        y: 48,
        kind: "stage",
        on: true,
      },
      {
        id: "domain",
        label: t("as_domain", locale),
        sub: domainTitle,
        x: 28,
        y: 128,
        kind: "stage",
        on: true,
      },
    ];
    const colX = 210;
    const startY = 28;
    picked.forEach((m, i) => {
      list.push({
        id: `m-${m.id}`,
        label: m.title,
        sub:
          m.id === "k3-stream"
            ? t("as_exit2_sub", locale)
            : m.id === "failspy"
              ? t("as_analog_apply", locale)
              : t("as_method", locale),
        x: colX,
        y: startY + i * 72,
        kind: "method",
        on: true,
        warn: m.id === "k3-stream" || m.id === "failspy",
      });
    });
    if (!picked.length) {
      list.push({
        id: "m-empty",
        label: t("as_no_method", locale),
        sub: t("as_no_method_sub", locale),
        x: colX,
        y: 72,
        kind: "method",
        on: false,
      });
    }
    const zipY = Math.max(88, 28 + Math.max(picked.length, 1) * 36);
    list.push({
      id: "compute",
      label: t("as_compute", locale),
      sub: computeTitle,
      x: 392,
      y: zipY - 40,
      kind: "stage",
      on: true,
    });
    list.push({
      id: "zip",
      label: `ZIP ${fileCount}/17`,
      sub: k3 ? t("as_k3_sub", locale) : t("as_assemble_sub", locale),
      x: 392,
      y: zipY + 44,
      kind: "zip",
      on: fileCount === 17,
      warn: k3,
    });
    return list;
  }, [purposeTitle, domainTitle, computeTitle, picked, fileCount, k3, locale]);

  const height = Math.max(220, 56 + Math.max(picked.length, 2) * 72);

  const tape = useMemo(
    () =>
      (sh ?? "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .slice(0, 18),
    [sh],
  );

  function saveRecipe() {
    const snap: RecipeSnap = {
      id: `r-${Date.now().toString(36)}`,
      name: (name.trim() || purposeTitle).slice(0, 48),
      savedAt: Date.now(),
      purpose: purposeId,
      domain: domainId,
      methods: [...selectedIds],
      outputs: [...outputs],
      compute: computeId,
    };
    const next = [snap, ...recipes].slice(0, 24);
    persistRecipes(next);
    setRecipes(next);
    setName("");
  }

  return (
    <section className="panel rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
            <GitBranch className="size-3.5" /> {t("as_flow_title", locale)}
          </p>
          <p className="mt-1 text-xs text-warn">{t("as_flow_warn", locale)}</p>
        </div>
        <span className="chip-on inline-flex min-h-11 items-center rounded-md px-3 text-xs font-semibold">
          {t("as_picked", locale)
            .replace("{m}", String(picked.length))
            .replace("{o}", String(outputs.length))}
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 560 ${height}`}
            className="h-auto min-h-52 w-full min-w-[32rem] text-fg"
            role="img"
            aria-label={t("as_flow_aria", locale)}
          >
            {picked.map((m) => {
              const from = nodes.find((n) => n.id === "purpose");
              const to = nodes.find((n) => n.id === `m-${m.id}`);
              if (!from || !to) return null;
              return (
                <path
                  key={`e-${m.id}`}
                  d={`M ${from.x + 148} ${from.y + 22} C ${from.x + 190} ${from.y + 22}, ${to.x - 24} ${to.y + 22}, ${to.x} ${to.y + 22}`}
                  fill="none"
                  stroke="rgba(125,215,201,0.45)"
                  strokeWidth="1.5"
                />
              );
            })}
            {nodes
              .filter((n) => n.kind === "method")
              .map((n) => {
                const zip = nodes.find((x) => x.id === "compute");
                if (!zip) return null;
                return (
                  <path
                    key={`z-${n.id}`}
                    d={`M ${n.x + 148} ${n.y + 22} C ${n.x + 190} ${n.y + 22}, ${zip.x - 24} ${zip.y + 22}, ${zip.x} ${zip.y + 22}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="1.25"
                  />
                );
              })}
            {(() => {
              const a = nodes.find((n) => n.id === "compute");
              const b = nodes.find((n) => n.id === "zip");
              if (!a || !b) return null;
              return (
                <path
                  d={`M ${a.x + 74} ${a.y + 44} L ${b.x + 74} ${b.y}`}
                  fill="none"
                  stroke="rgba(125,215,201,0.55)"
                  strokeWidth="1.5"
                />
              );
            })()}
            {nodes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x} ${n.y})`}
                className="cursor-pointer"
                onClick={() => {
                  setFocus(n.id);
                  if (n.id.startsWith("m-") && n.id !== "m-empty") onToggleMethod(n.id.slice(2));
                }}
              >
                <rect
                  width={n.kind === "zip" ? 148 : 148}
                  height={44}
                  rx={8}
                  className={
                    focus === n.id
                      ? "fill-[color-mix(in_srgb,var(--color-accent)_22%,#191a1b)] stroke-[var(--color-accent)]"
                      : n.on
                        ? "fill-[#191a1b]/90 stroke-white/15"
                        : "fill-black/30 stroke-white/8"
                  }
                  strokeWidth={focus === n.id ? 1.5 : 1}
                />
                <text
                  x={12}
                  y={18}
                  className="fill-current text-[10px] font-semibold uppercase tracking-wider opacity-60"
                >
                  {n.label}
                </text>
                <text
                  x={12}
                  y={34}
                  className={`text-[11px] ${n.warn ? "fill-[#c4b8a5]" : "fill-current"}`}
                >
                  {n.sub.slice(0, 22)}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-1 text-[11px] text-subtle">{t("as_method_hint", locale)}</p>
        </div>

        <div className="panel-strong rounded-lg p-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
            <Layers className="size-3.5" /> {t("as_composer", locale)}
          </p>
          <input
            className="mt-3 h-11 w-full rounded-md border border-border bg-black/30 px-3 text-sm text-fg outline-none focus:border-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("as_recipe_name_ph", locale)}
            aria-label={t("as_recipe_name_ph", locale)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {outputLabels.map((o) => {
              const on = outputs.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onToggleOutput(o.id)}
                  className={`inline-flex min-h-11 items-center rounded-md border px-2.5 text-[11px] font-semibold ${
                    on ? "chip-on text-fg" : "border-white/10 text-muted hover:text-fg"
                  }`}
                >
                  {o.title}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn-primary mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold"
            onClick={saveRecipe}
          >
            <Save className="size-4" /> {t("as_recipe_save", locale)}
          </button>
          <ul className="mt-3 max-h-40 space-y-1 overflow-auto">
            {recipes.length === 0 ? (
              <li className="text-xs text-subtle">{t("as_no_recipes", locale)}</li>
            ) : (
              recipes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between rounded-md px-2 text-left text-xs hover:bg-white/5"
                    onClick={() => onApply(r)}
                  >
                    <span className="truncate font-semibold text-fg">{r.name}</span>
                    <span className="shrink-0 text-subtle">
                      {t("as_methods_count", locale).replace("{n}", String(r.methods.length))}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <ol className="mt-4 space-y-1 panel-strong rounded-lg p-3">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          <Terminal className="size-3.5" /> {t("as_cmd_tape", locale)}
        </p>
        {tape.length === 0 ? (
          <li className="text-xs text-subtle">{t("as_no_runsh", locale)}</li>
        ) : (
          tape.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 24)}`}
              className="flex min-h-11 gap-2 font-mono text-[11px] leading-snug text-muted"
            >
              <span className="w-6 shrink-0 text-subtle">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 break-all">{line.slice(0, 220)}</span>
            </li>
          ))
        )}
      </ol>

      <div className="mt-4 panel-strong rounded-lg p-3">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          <MessageSquare className="size-3.5" /> {t("as_pack_preview", locale)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PACK_DOWNLOAD_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTalk(n)}
              className={`inline-flex min-h-11 items-center rounded-md border px-2.5 font-mono text-[11px] ${
                talk === n ? "chip-on text-fg" : "border-white/10 text-muted hover:text-fg"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <pre className="code-block mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
          {(files[talk] ?? "").slice(0, 4000) || t("as_empty", locale)}
        </pre>
      </div>

      <div className="mt-4 panel-strong rounded-lg p-3">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          <Puzzle className="size-3.5" /> {t("as_slots", locale)}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {slots.map((slot, i) => (
            <Field key={slot.id} label={slotTitle(slot.id)} htmlFor={`as-slot-${slot.id}`}>
              <input
                id={`as-slot-${slot.id}`}
                className="mt-1 h-11 w-full rounded-md border border-border bg-black/30 px-3 text-sm text-fg outline-none focus:border-accent"
                value={slot.note}
                placeholder={t("as_slot_ph", locale)}
                onChange={(e) => {
                  const next = slots.map((x, j) =>
                    j === i ? { ...x, note: e.target.value.slice(0, 80) } : x,
                  );
                  setSlots(next);
                  try {
                    localStorage.setItem(SLOT_KEY, JSON.stringify(next));
                  } catch {
                    /* quota */
                  }
                }}
              />
            </Field>
          ))}
        </div>
      </div>
    </section>
  );
}
