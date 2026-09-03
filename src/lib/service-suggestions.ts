import {
  countQueryMatches,
  matchesQueryTokens,
  splitQueryTokens,
} from "@/lib/frontend-search-filters";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

export type ServiceSuggestion = {
  /** The tag itself — this is both the label and the query it runs. */
  tag: string;
  /** What /search?q=<tag> will actually return — facilities, doctors and
   * specialists combined, exactly as /search's own count line counts them. */
  resultCount: number;
};

const MAX_SERVICE_SUGGESTIONS = 3;

// Every distinct service tag in the directory, with the number of facilities
// carrying it. Cheap to build (one pass over the already-loaded list) and used
// only to rank candidates before the exact counts are computed. Tags only ever
// come from facility records — services aren't a field doctors or specialists
// carry — but a tag's final count (below) still folds those in, because a
// query for that tag text can match a specialist's specialty too.
function collectTags(facilities: Facility[]): Map<string, number> {
  const tags = new Map<string, number>();
  for (const facility of facilities) {
    const custom = Object.values(facility.customServiceCategories ?? {}).flat() as string[];
    // Deduped per facility so a tag listed in both services and a custom
    // category cannot count that facility twice.
    for (const tag of new Set([...(facility.services ?? []), ...custom])) {
      if (tag) tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return tags;
}

// Service tags worth offering as a query for what the visitor has typed.
//
// The suggestion is the TAG, not the facilities under it: one row standing for
// "EEG" is more use than ten hospital names, and it says up front how much the
// search will return.
//
// Counts come from countQueryMatches — the same combined facilities + doctors
// + specialists total /search's own result count uses — rather than from the
// number of facilities carrying the tag. All three of those numbers can
// differ: 19 facilities tag "Dialysis" but countQueryMatches("Dialysis")
// returns 20 (one more matches a related tag), and "Pediatrics" returns 6 —
// 5 facilities plus Dr. Kale-Ab Tesfaye, whose specialty is Pediatrics — not
// 5. Counting the tag suggestion the exact way the results page counts its
// own results is what makes the promised number the delivered number; the
// two used to disagree (5 vs 6) because this used to count facilities only.
export function getServiceSuggestions(
  facilities: Facility[],
  doctors: Doctor[],
  specialists: SpecialistListItem[],
  query: string,
  limit = MAX_SERVICE_SUGGESTIONS,
): ServiceSuggestion[] {
  const tokens = splitQueryTokens(query);
  if (!tokens.length) return [];

  const tags = collectTags(facilities);

  // Shortest first, then by how many facilities carry it. Shortest-first is
  // what makes the collapse below pick "MRI" over "MRI (1.5 Tesla)".
  const matching = [...tags.entries()]
    .filter(([tag]) => matchesQueryTokens(tag, tokens))
    .sort((a, b) => a[0].length - b[0].length || b[1] - a[1]);

  // Collapse tag families to the one tag that stands for them. A longer tag is
  // dropped when a shorter kept tag's own tokens already match it — "Dialysis"
  // matches "Dialysis unit", "MRI" matches "MRI (1.5 Tesla)" — so the visitor
  // is offered one row per idea instead of three near-identical ones. This
  // reuses the same matcher rather than introducing a similarity rule.
  const canonical: string[] = [];
  for (const [tag] of matching) {
    const alreadyCovered = canonical.some((kept) =>
      matchesQueryTokens(tag, splitQueryTokens(kept)),
    );
    if (!alreadyCovered) canonical.push(tag);
    if (canonical.length >= limit) break;
  }

  // Exact counts last, so countQueryMatches runs at most `limit` times per
  // request rather than once per candidate tag.
  return canonical
    .map((tag) => ({ tag, resultCount: countQueryMatches(facilities, doctors, specialists, tag) }))
    .filter((suggestion) => suggestion.resultCount > 0);
}
