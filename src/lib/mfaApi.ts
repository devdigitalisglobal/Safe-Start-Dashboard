const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type MfaStatusResponse = {
  mfaEnrolled: boolean;
  unusedRecoveryCodes: number;
};

export type RecoveryCodesResponse = {
  codes: string[];
};

async function mfaRequest<T>(path: string, token: string, init?: RequestInit) {
  if (!API_URL) throw new Error('API URL is not configured');

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function fetchMfaStatus(token: string) {
  return mfaRequest<MfaStatusResponse>('/users/me/mfa/status', token);
}

export async function generateRecoveryCodes(token: string) {
  return mfaRequest<RecoveryCodesResponse>('/users/me/mfa/recovery-codes/generate', token, {
    method: 'POST',
    body: '{}',
  });
}

export async function redeemRecoveryCode(token: string, code: string) {
  return mfaRequest<{ redeemed: boolean; reenrollRequired: boolean }>(
    '/users/me/mfa/recovery-codes/redeem',
    token,
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );
}
