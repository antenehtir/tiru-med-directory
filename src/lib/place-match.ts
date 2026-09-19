// Matching a typed place ("cmc", "gazebo", "bole medhanialem") against the
// free text facilities use to say where they are.
//
// Word by word rather than one substring: "cmc michael" finds "CMC area,
// in front of St Michael church" although the words are not side by side.
// Each typed word must match a word of the text by its start ("megen" →
// "Megenagna"), or — for words of five letters or more — with one letter
// different, because the same place is spelt more than one way across
// listings ("Megenagha" / "Megenagna") and a patient should not have to
// guess which spelling a facility used.
import type { Facility } from "@/types/facility";

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

// Levenshtein distance, capped: only "is it at most 1?" is ever asked.
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const MIN_FUZZY_LENGTH = 5;

function wordMatches(typed: string, word: string): boolean {
  if (word.startsWith(typed)) return true;
  if (typed.length < MIN_FUZZY_LENGTH) return false;
  // A whole word with one slip, or the start of a longer word with one slip
  // ("megenah" while typing towards "megenagna").
  return (
    withinOneEdit(typed, word) ||
    (word.length > typed.length && withinOneEdit(typed, word.slice(0, typed.length)))
  );
}

export function placeTextMatches(text: string, query: string): boolean {
  const typed = words(query);
  if (typed.length === 0) return true;
  const textWords = words(text);
  return typed.every((t) => textWords.some((w) => wordMatches(t, w)));
}

// Everything a facility says about where it is: its area (neighbourhood and
// landmark), address, and every branch — a branch "in front of Gazebo
// square" is as much a place a patient can reach as the main building.
export function facilityPlaceText(facility: Facility): string {
  const branches = (facility.branches ?? []).flatMap((branch) => [branch.name, branch.area, branch.landmark]);
  return [facility.area ?? "", facility.location, facility.address, ...branches].filter(Boolean).join(" · ");
}
