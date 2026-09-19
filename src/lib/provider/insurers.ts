// Insurers are stored as one text column (insurance_note) that the public
// page shows as written. The editors show them as a list of chips, so they
// are split on the separators people type and joined back with ", ".
export function splitInsurers(note: string | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of (note ?? "").split(/[,;\n]/)) {
    const name = part.trim().replace(/\s+/g, " ");
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      out.push(name);
    }
  }
  return out;
}

export function joinInsurers(names: string[]): string | null {
  return names.length > 0 ? names.join(", ") : null;
}
