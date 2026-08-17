export function buildTotpUri(secret: string, email: string) {
  const label = encodeURIComponent(`Safe Start:${email}`);
  const issuer = encodeURIComponent('Safe Start');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
}

export function resolveTotpUri(uri: string | undefined, secret: string, email: string) {
  if (uri?.startsWith('otpauth://')) return uri;
  return buildTotpUri(secret, email);
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement | null,
  uri: string
): Promise<void> {
  if (!canvas) return;

  const QRCode = (await import('qrcode')).default;
  await QRCode.toCanvas(canvas, uri, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
  });
}
