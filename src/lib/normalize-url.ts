// Shared with Step2LocationForm (provider onboarding) and the admin facility
// contact editor — both let a provider/admin type a bare domain
// ("tiktok.com/@x") and store a real, clickable URL.
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
