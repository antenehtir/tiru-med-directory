"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeaderSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form
      className="hidden h-10 min-w-0 flex-1 items-center rounded-full border border-border bg-background px-2.5 text-sm text-muted-foreground transition-[border-color,box-shadow,background-color] focus-within:border-strong-border focus-within:bg-card focus-within:shadow-[0_1px_4px_rgba(31,41,55,0.04)] lg:flex lg:max-w-[18rem] xl:max-w-sm"
      onSubmit={submitSearch}
      role="search"
    >
      <input
        aria-label="Search providers"
        className="h-full min-w-0 flex-1 rounded-full bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
        placeholder="Search hospitals, clinics, diagnostics"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        aria-label="Search"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
        type="submit"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </form>
  );
}
