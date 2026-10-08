// src/lib/api.ts
// Rails API向けの共通fetchラッパー。
// 開発時はvite.config.tsのプロキシ、本番はVercelのrewritesにより
// フロントから見て /api は常に同一オリジン扱いになる想定。
// そのためセッションCookieはブラウザ標準の同一オリジン送信に任せ、localStorageは使わない。
const API_BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `リクエストに失敗しました。(${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // レスポンスがJSONでない場合はデフォルトメッセージのまま
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
