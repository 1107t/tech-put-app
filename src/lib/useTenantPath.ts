// src/lib/useTenantPath.ts
// user側ルートは /tenant/:tenantId/users/* 配下に置かれる。
// 現在のURLからtenantIdを取り出し、相対パス（例: "/dashboard"）を
// テナント付きの絶対パス（例: "/tenant/1/users/dashboard"）に変換するヘルパー。
import { useParams } from "react-router-dom";

export function useTenantPath(): (suffix: string) => string {
  const { tenantId } = useParams<{ tenantId: string }>();
  return (suffix: string) => `/tenant/${tenantId}/users${suffix}`;
}
