"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

// Below this many typed characters a prefix is too ambiguous to complete
// with any confidence — "me" could become a dozen different facility names,
// and a wrong guess sitting right after the caret reads as the page putting
// words in the visitor's mouth. Four is roughly where a prefix starts
// meaning one specific thing more often than not.
const MIN_QUERY_LENGTH_TO_PREDICT = 4;

// The remainder of the closest-matching suggestion's own name, or "" when
// there's nothing confident to predict. Takes the first suggestion (the
// list is already priority-ordered: facility, then specialist, then
// service) whose name starts with what was typed — same casing rule
// findKnownMatch/buildQueryTokenPattern use elsewhere in this app: complete
// with the catalogue's own spelling, not a re-typed guess at it.
export function bestCompletion(query: string, suggestions: { name: string }[]): string {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH_TO_PREDICT) return "";
  // Only a prefix at the very end of the field predicts anything — a
  // trailing space means the visitor finished a word and moved on to the
  // next one, which this single-suggestion completion isn't built to guess.
  if (query !== trimmed && !query.endsWith(trimmed)) return "";
  const lower = trimmed.toLowerCase();
  const match = suggestions.find(
    (s) => s.name.length > trimmed.length && s.name.toLowerCase().startsWith(lower),
  );
  return match ? match.name.slice(trimmed.length) : "";
}

// Computed-style properties that affect where text lands inside the box —
// mirrored from the live input onto the ghost overlay so the predicted
// remainder lines up exactly behind the caret regardless of which
// className a caller passes the input (SearchAutocompleteInput's
// inputClassName varies by call site: hero, header, wherever it's reused).
// Reading the computed style rather than duplicating a class list is what
// keeps this correct if any of those change independently.
const MIRRORED_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "textTransform",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "borderLeftWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "boxSizing",
  "lineHeight",
] as const;

// Light, greyed-out text predicting the rest of a facility, specialist, or
// service name past what's typed — press Tab to accept it, keep typing to
// ignore it. Rendered ON TOP of the real input (pointer-events-none, so
// typing and clicking still reach the input underneath) rather than behind
// it, so it needs no change to the input's own background: the typed
// portion of the overlay is invisible, letting the real input's own text
// show through unobstructed, and only the remainder — sitting past where
// the real text ends — actually renders.
export function GhostTextOverlay({
  inputRef,
  query,
  completion,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  completion: string;
}) {
  const [mirroredStyle, setMirroredStyle] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || !completion) return;
    const computed = window.getComputedStyle(input) as unknown as Record<string, string>;
    const next: Record<string, string> = {};
    for (const prop of MIRRORED_STYLE_PROPS) next[prop] = computed[prop];
    setMirroredStyle(next);
  }, [inputRef, completion]);

  if (!completion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 flex items-center overflow-hidden whitespace-pre"
      style={mirroredStyle}
    >
      <span className="invisible">{query}</span>
      <span className="text-muted-foreground/55">{completion}</span>
    </div>
  );
}

// Shared "did the caret just ask to accept the ghost?" check: Tab, or the
// Right arrow — the key that already means "move to the end of the text",
// which is exactly where the caret already sits whenever a completion is
// showing, so it would otherwise do nothing at all. Both require nothing
// selected and the caret sitting at the end of the typed text — the same
// place accepting the completion would extend from. Shift is only excluded
// for Tab (Shift+Tab means "focus backward"); Shift+ArrowRight extends a
// selection, which never applies here since the caret is already at the end
// with nothing selected. Exported so both search bars ask the same question
// rather than two slightly different ones.
export function isAcceptGhostKey(
  event: { key: string; shiftKey: boolean },
  input: HTMLInputElement | null,
): boolean {
  if (!input) return false;
  if (event.key !== "Tab" && event.key !== "ArrowRight") return false;
  if (event.key === "Tab" && event.shiftKey) return false;
  return input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
}
