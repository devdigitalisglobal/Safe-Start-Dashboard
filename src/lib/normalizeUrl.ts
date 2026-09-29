/** Accept `example.com/path` or full `https://…` for CMS external links. */
export function normalizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('URL is required');
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withScheme).href;
}
