// src/lib/useRequireAuth.ts【新規作成】
// 認証ガードのカスタムフック。
// 未ログインなら /login にリダイレクトし、ログアウト処理も提供する。
// DashboardPage・TweetsPage など複数ページで重複していた認証コードをここに集約。
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "./api";
import { getCurrentUser, logout } from "./userApi";
import type { User } from "./userTypes";

// ログイン後の画面はURLにtenantIdを含まないため、ログイン時に保存した
// tenantIdからログイン画面のパスを復元する（未保存ならデフォルトテナントへ）。
function loginPath(): string {
  const tenantId = tokenStorage.getUserTenantId();
  return tenantId ? `/tenant/${tenantId}/users/login` : "/";
}

export function useRequireAuth(): { me: User | null; handleLogout: () => Promise<void> } {
  // ログイン中のユーザー情報（取得完了まで null）
  const [me, setMe] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // IndexedDB からログイン中のユーザーを取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate(loginPath(), { replace: true });
        return;
      }
      setMe(currentUser);
    })();
  }, [navigate]);

  // ログアウト処理: ストアをクリアして自分のテナントのログインへリダイレクト
  const handleLogout = async () => {
    await logout();
    navigate(loginPath(), { replace: true });
  };

  return { me, handleLogout };
}
