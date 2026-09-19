// Neighbourhood suggestions for the Filters "Neighbourhood / Area" box.
//
// Facilities describe where they are in sentences — "cmc around yetebaberut
// roundabout, infront of tsehay real state". Offering those as suggestions
// reads like a list of addresses. Instead, place names are pulled out of
// them: the word the visitor is typing ("CMC"), and that word with the one
// after it when that is a name too ("Bole Medhanialem") — never with a
// filler word ("CMC around"). Each suggestion says how many facilities
// mention it.

export type AreaSuggestion = { label: string; count: number };

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

// Words that describe a position rather than name a place.
const FILLER_WORDS = new Set([
  "a", "around", "at", "area", "behind", "beside", "bldg", "building", "by", "close", "front",
  "in", "infront", "near", "next", "of", "on", "opposite", "road", "round", "roundabout",
  "side", "st", "street", "the", "to", "towards", "and", "floor",
]);

function tokens(text: string): string[] {
  return text
    .split(/[\s,;/()]+/)
    .map((t) => t.replace(/[^\p{L}\p{N}'-]/gu, ""))
    .filter(Boolean);
}

// "cmc" → "CMC", "bole" → "Bole", "medhanialem" → "Medhanialem".
function prettify(phrase: string): string {
  return phrase
    .split(" ")
    .map((word) =>
      word.length <= 3 && /^\p{L}+$/u.test(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function suggestAreas(areaTexts: string[], query: string): AreaSuggestion[] {
  const needle = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (needle.length < MIN_QUERY_LENGTH) return [];
  const needleWords = needle.split(" ");

  const counts = new Map<string, number>();

  for (const text of areaTexts) {
    const words = tokens(text).map((w) => w.toLowerCase());
    const found = new Set<string>();

    for (let i = 0; i + needleWords.length <= words.length; i += 1) {
      // Every typed word must match in order; the last may be half-typed.
      const matches = needleWords.every((nw, j) =>
        j === needleWords.length - 1 ? words[i + j].startsWith(nw) : words[i + j] === nw,
      );
      if (!matches) continue;

      const head = words.slice(i, i + needleWords.length);
      if (FILLER_WORDS.has(head[head.length - 1])) continue;
      found.add(head.join(" "));

      const next = words[i + needleWords.length];
      if (next && !FILLER_WORDS.has(next) && !/^\d+$/.test(next) && next.length > 2) {
        found.add([...head, next].join(" "));
      }
    }

    for (const phrase of found) counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  const ranked = [...counts.entries()]
    .map(([phrase, count]) => ({ phrase, count }))
    // A two-word phrase is only worth offering when it names a place of its
    // own — mentioned by more than one facility.
    .filter(({ phrase, count }) => phrase.split(" ").length === needleWords.length || count > 1)
    .sort((a, b) => b.count - a.count || a.phrase.length - b.phrase.length);

  return ranked.slice(0, MAX_SUGGESTIONS).map(({ phrase, count }) => ({ label: prettify(phrase), count }));
}
