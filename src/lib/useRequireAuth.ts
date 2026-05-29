// src/lib/useRequireAuth.ts【新規作成】
// 認証ガードのカスタムフック。
// 未ログインなら /login にリダイレクトし、ログアウト処理も提供する。
// DashboardPage・TweetsPage など複数ページで重複していた認証コードをここに集約。
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "./usersStore";
import type { User } from "./users";

export function useRequireAuth(): { me: User | null; handleLogout: () => Promise<void> } {
  // ログイン中のユーザー情報（取得完了まで null）
  const [me, setMe] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // IndexedDB からログイン中のユーザーを取得
      const currentUser = await getCurrentUser();
      // 未ログインなら /login にリダイレクト
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(currentUser);
    })();
  }, [navigate]);

  // ログアウト処理: ストアをクリアして /login にリダイレクト
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return { me, handleLogout };
}
