const IMAGE_URL_PATTERN = /\.(jpe?g|png|webp|gif)(\?|$)/i;
const PDF_URL_PATTERN = /\.pdf(\?|$)/i;

/** JPG/PDF guides open in-app; other URLs use the system browser. */
export function isInAppGuideUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split('#')[0];
  return IMAGE_URL_PATTERN.test(path) || PDF_URL_PATTERN.test(path);
}
