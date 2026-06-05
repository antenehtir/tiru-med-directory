import { PageShell } from "@/components/layout/PageShell";
import { SearchResultsPage } from "@/components/search-results/SearchResultsPage";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeSearchParam(params?.q);

  return (
    <PageShell>
      <SearchResultsPage query={query} />
    </PageShell>
  );
}
