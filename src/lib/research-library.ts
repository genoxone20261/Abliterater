export type ResearchKind = "all" | "papers" | "repos";

type PaperLike = {
  id: string;
  title: string;
  year: string;
  authors: string;
};

type RepoLike = {
  name: string;
  url: string;
  role: string;
  use: string;
};

function searchable(parts: Array<string | number | undefined>): string {
  return parts
    .filter((part): part is string | number => part !== undefined)
    .join(" ")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Pure filtering for the research library; rendering and localization stay in the route. */
export function filterResearchLibrary<P extends PaperLike, R extends RepoLike>(
  papers: readonly P[],
  repos: readonly R[],
  query: string,
  kind: ResearchKind,
): { papers: P[]; repos: R[]; total: number } {
  const needle = searchable([query]);
  const matchedPapers =
    kind === "repos"
      ? []
      : papers.filter(
          (paper) =>
            !needle ||
            searchable([paper.title, paper.year, paper.authors, paper.id]).includes(needle),
        );
  const matchedRepos =
    kind === "papers"
      ? []
      : repos.filter(
          (repo) =>
            !needle || searchable([repo.name, repo.role, repo.use, repo.url]).includes(needle),
        );

  return {
    papers: matchedPapers,
    repos: matchedRepos,
    total: matchedPapers.length + matchedRepos.length,
  };
}
