import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileText, GitBranch, Keyboard, Library, Search, Wrench } from "lucide-react";
import { PAPERS, REPOS, paperAbs, paperPdf } from "@/lib/catalog";
import { filterResearchLibrary, type ResearchKind } from "@/lib/research-library";
import { Studio } from "@/components/Studio";
import { useLocale, t } from "@/lib/i18n";
import { LICENSE_UNCHECKED } from "@/lib/source-search";
import { emitPutSource } from "@/lib/put-source";
import { repoCopy } from "@/lib/repo-copy";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/")({ component: Home });

type Tab = "studio" | "papers";

type Shortcut = { keys: string[]; descKo: string; descEn: string; scope: "global" | "studio" };

const SHORTCUTS: Shortcut[] = [
  { keys: ["Ctrl", "S"], descKo: "현재 작업 저장", descEn: "Save current job", scope: "global" },
  { keys: ["Ctrl", "D"], descKo: "팩 다운로드", descEn: "Download Pack", scope: "global" },
  { keys: ["Ctrl", "/"], descKo: "단축키 도움말", descEn: "Shortcuts help", scope: "global" },
  { keys: ["?"], descKo: "단축키 도움말", descEn: "Shortcuts help", scope: "global" },
  { keys: ["1"], descKo: "작업대 탭", descEn: "Studio Tab", scope: "global" },
  { keys: ["2"], descKo: "연구 자료 탭", descEn: "Research tab", scope: "global" },
  { keys: ["Esc"], descKo: "모달·다이얼로그 닫기", descEn: "Close dialog", scope: "global" },
];

function ShortcutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [locale] = useLocale();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("shortcuts_title", locale)}
      description={t("shortcuts_desc", locale)}
    >
      <ul className="divide-y divide-border">
        {SHORTCUTS.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="text-muted">{locale === "en" ? s.descEn : s.descKo}</span>
            <span className="shortcut-group">
              {s.keys.map((k) => (
                <kbd key={k} className="kbd">
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

function TabButton({
  id,
  active,
  label,
  icon: Icon,
  onClick,
  index,
}: {
  id: string;
  active: boolean;
  label: string;
  icon: typeof Wrench;
  onClick: () => void;
  index: 1 | 2;
}) {
  const [locale] = useLocale();
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`tab-${id}`}
      aria-controls={`panel-${id}`}
      tabIndex={active ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End")
          return;
        e.preventDefault();
        const tabs = Array.from(
          e.currentTarget
            .closest('[role="tablist"]')
            ?.querySelectorAll<HTMLButtonElement>("[role=tab]") ?? [],
        );
        const current = tabs.indexOf(e.currentTarget);
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : (current + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.focus();
        tabs[next]?.click();
      }}
      onClick={onClick}
      className={`tab-pill inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 text-xs font-semibold sm:gap-2 sm:px-4 sm:text-sm ${
        active ? "bg-elevated text-fg" : "text-muted hover:text-fg"
      }`}
    >
      <Icon className="size-4" />
      {label}
      <span className="sr-only">
        ({t("tab_shortcut_sr", locale).replace("{n}", String(index))})
      </span>
    </button>
  );
}

function SectionCard({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-panel space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
        {blurb ? <p className="mt-1 text-xs leading-relaxed text-muted">{blurb}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [locale] = useLocale();

  useEffect(() => {
    setHydrated(true);
  }, []);
  const [tab, setTab] = useState<Tab>("studio");
  const [helpOpen, setHelpOpen] = useState(false);
  const [researchQuery, setResearchQuery] = useState("");
  const [researchKind, setResearchKind] = useState<ResearchKind>("all");
  const research = useMemo(
    () => filterResearchLibrary(PAPERS, REPOS, researchQuery, researchKind),
    [researchQuery, researchKind],
  );

  const tabs = useMemo(
    () =>
      [
        { id: "studio" as const, label: t("tab_studio", locale), icon: Wrench },
        { id: "papers" as const, label: t("tab_papers", locale), icon: Library },
      ] as const,
    [locale],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.isComposing || document.querySelector('[role="dialog"]')) return;
      if (e.target instanceof HTMLElement && e.target.closest('select,[contenteditable="true"]'))
        return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          const btn = document.querySelector<HTMLButtonElement>("[data-shortcut='save']");
          btn?.click();
        }
        if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          const btn = document.querySelector<HTMLButtonElement>("[data-shortcut='download']");
          btn?.click();
        }
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "1") setTab("studio");
        if (e.key === "2") setTab("papers");
        if (e.key === "?" || e.key === "/") setHelpOpen((v) => !v);
      }
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setHelpOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <a href="#main" className="skip-link">
        {t("skip_to_content", locale)}
      </a>
      <header className="hero hero-compact app-command-header">
        <div className="app-shell command-header-inner">
          <div className="command-brand">
            <p className="command-kicker">{t("hero_badge", locale)}</p>
            <h1 className="command-title">
              <span>{t("hero_title", locale)}</span>
              <span className="command-title-divider" aria-hidden>
                —
              </span>
              <span className="command-subtitle">{t("hero_subtitle", locale)}</span>
            </h1>
          </div>
          <p className="hero-desc command-description">{t("hero_desc", locale)}</p>
          <div className="hero-pills command-status" aria-label={t("pill_tab", locale)}>
            <div className="stat-pill">
              <span className="status-dot" data-state="idle" aria-hidden />
              <strong>{tab === "studio" ? t("tab_studio", locale) : t("tab_papers", locale)}</strong>
            </div>
            <div className="stat-pill">
              <strong className="font-mono">{t("pill_formats", locale)}</strong>
            </div>
          </div>
        </div>
      </header>

      <nav
        className="app-primary-nav sticky top-0 z-20 max-w-full overflow-x-clip"
        aria-label={t("nav_main", locale)}
      >
        <div className="app-shell nav-inner">
          <div
            role="tablist"
            aria-label={t("nav_main_tabs", locale)}
            className="flex min-w-0 flex-wrap gap-1 sm:gap-2"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabButton
                key={id}
                id={id}
                active={tab === id}
                label={label}
                icon={Icon}
                index={id === "studio" ? 1 : 2}
                onClick={() => setTab(id)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-haspopup="dialog"
              aria-label={t("shortcuts_title", locale)}
              className="shortcut-trigger"
            >
              <Keyboard className="size-4 text-primary" aria-hidden />
              <span className="shortcut-label">{t("kbd_help", locale)}</span>
            </button>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      <main id="main" data-hydrated={hydrated} className="app-shell py-4 sm:py-5">
        <section
          id="panel-studio"
          role="tabpanel"
          aria-labelledby="tab-studio"
          hidden={tab !== "studio"}
          inert={tab !== "studio" ? true : undefined}
        >
          <Studio />
        </section>
        <section
          id="panel-papers"
          role="tabpanel"
          aria-labelledby="tab-papers"
          hidden={tab !== "papers"}
          inert={tab !== "papers" ? true : undefined}
          className="research-library space-y-4"
        >
          <div className="research-toolbar">
            <label className="research-search" htmlFor="research-query">
              <Search className="size-4" aria-hidden />
              <span className="sr-only">{t("research_search_label", locale)}</span>
              <input
                id="research-query"
                value={researchQuery}
                onChange={(event) => setResearchQuery(event.target.value)}
                placeholder={t("research_search_ph", locale)}
              />
            </label>
            <div
              className="research-filters"
              role="group"
              aria-label={t("research_filter_aria", locale)}
            >
              {(["all", "papers", "repos"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className="research-filter"
                  data-selected={researchKind === kind}
                  aria-pressed={researchKind === kind}
                  onClick={() => setResearchKind(kind)}
                >
                  {t(
                    kind === "all"
                      ? "research_filter_all"
                      : kind === "papers"
                        ? "research_filter_papers"
                        : "research_filter_repos",
                    locale,
                  )}
                </button>
              ))}
            </div>
            <span className="research-count" role="status" aria-live="polite" data-research-count>
              {t("research_results_count", locale).replace("{n}", String(research.total))}
            </span>
          </div>

          {research.total === 0 ? (
            <div className="empty-state" data-research-empty>
              <strong>{t("research_empty_title", locale)}</strong>
              <span>{t("research_empty_body", locale)}</span>
            </div>
          ) : (
            <div className="research-grid">
              {research.papers.length > 0 ? (
                <SectionCard
                  title={`${t("files_papers", locale)} · ${research.papers.length}`}
                  blurb={t("papers_blurb", locale)}
                >
                  <ul className="ref-list">
                    {research.papers.map((paper) => (
                      <li key={paper.id} className="ref-item">
                        <p className="ref-title">{paper.title}</p>
                        <p className="ref-meta">
                          <span>{paper.year}</span>
                          <span aria-hidden>·</span>
                          <span>{paper.authors}</span>
                        </p>
                        <div className="ref-links">
                          <a
                            className="ref-link"
                            href={paperAbs(paper.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("paper_abs", locale)}
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                          <a
                            className="ref-link"
                            href={paperPdf(paper.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText className="size-3.5" aria-hidden />
                            {t("paper_pdf", locale)}
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                          <button
                            type="button"
                            className="ref-link"
                            onClick={() => {
                              emitPutSource({
                                source: "github",
                                hit: {
                                  id: paper.id,
                                  name: paper.title,
                                  url: paperAbs(paper.id),
                                  description: paper.authors,
                                  license: LICENSE_UNCHECKED,
                                },
                              });
                              setTab("studio");
                            }}
                          >
                            {t("paper_put", locale)}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ) : null}
              {research.repos.length > 0 ? (
                <SectionCard
                  title={`${t("files_repos", locale)} · ${research.repos.length}`}
                  blurb={t("repos_blurb", locale)}
                >
                  <ul className="ref-list">
                    {research.repos.map((r, idx) => (
                      <li key={`${r.url}#${idx}`} className="ref-item">
                        <a
                          className="ref-link ref-repo-link font-mono text-sm font-semibold text-fg"
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <GitBranch className="size-4" aria-hidden /> {r.name}
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                        <dl className="ref-details">
                          <div>
                            <dt>{t("research_role", locale)}</dt>
                            <dd>{repoCopy(r.name, "role", r.role, locale)}</dd>
                          </div>
                          <div>
                            <dt>{t("research_use", locale)}</dt>
                            <dd>{repoCopy(r.name, "use", r.use, locale)}</dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          className="ref-link"
                          onClick={() => {
                            emitPutSource({
                              source: "github",
                              hit: {
                                id: r.name,
                                name: r.name,
                                url: r.url,
                                description: r.use,
                                license: LICENSE_UNCHECKED,
                              },
                            });
                            setTab("studio");
                          }}
                        >
                          {t("repo_put", locale)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ) : null}
            </div>
          )}
        </section>
      </main>

      <footer role="contentinfo" className="border-t border-border">
        <div className="app-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <div className="status-bar">
            <span className="flex items-center gap-1.5">
              <span className="status-dot" data-state="ok" aria-hidden />
              {t("footer_org", locale)}
            </span>
            <span className="text-subtle-2">·</span>
            <span>{t("footer_author", locale)}</span>
            <span className="text-subtle-2">·</span>
            <a
              className="ref-link"
              href={t("footer_github", locale)}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <span className="text-subtle-2">·</span>
            <span>
              {t("footer_inquiry", locale)}:{" "}
              <a className="ref-link" href={`mailto:${t("footer_email", locale)}`}>
                {t("footer_email", locale)}
              </a>
            </span>
          </div>
          <div className="shortcut-hints text-xs text-muted">
            <span>{t("shortcuts_label", locale)}</span>
            <span className="shortcut-group">
              <kbd className="kbd">1</kbd> {t("tab_studio", locale)}
            </span>
            <span className="shortcut-group">
              <kbd className="kbd">2</kbd> {t("tab_papers", locale)}
            </span>
            <span className="shortcut-group">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">S</kbd> {t("kbd_save", locale)}
            </span>
            <span className="shortcut-group">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">D</kbd> {t("kbd_zip", locale)}
            </span>
          </div>
        </div>
      </footer>
      <ShortcutModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
