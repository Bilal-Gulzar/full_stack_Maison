/** Tiny fetch helper for /api/* — sends cookies, throws on non-2xx. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && (data as { error?: string }).error) || `Request failed (${res.status})`);
  return data as T;
}
