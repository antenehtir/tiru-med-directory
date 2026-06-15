import { PageShell } from "@/components/layout/PageShell";
import { SearchResultsPage } from "@/components/search-results/SearchResultsPage";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";

type SearchPageProps = {
  searchParams?: Promise<{
    focus?: string | string[];
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const shouldFocusSearch = normalizeSearchParam(params?.focus) === "1";
  const query = normalizeSearchParam(params?.q);

  return (
    <PageShell>
      <SearchResultsPage focusSearch={shouldFocusSearch} query={query} />
    </PageShell>
  );
}
