// Shared with SpecialistCard and the homepage "Near you" strip — was
// duplicated as a private getInitials() inside SpecialistCard.tsx; pulled out
// so a second copy doesn't quietly drift (e.g. one strips "Dr." and the other
// doesn't).
export function personInitials(name: string): string {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
