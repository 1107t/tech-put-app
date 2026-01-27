// src/pages/users/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";

export default function DashboardPage() {
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return nav("/login", { replace: true });
      setMe(u);
    })();
  }, [nav]);

  const onLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        <div className="fw-bold mb-3">ネイテク</div>

        <div className="user-dashboard__profile">
          <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
            {me.name}
          </Link>
          <div className="user-dashboard__divider" />
        </div>
        <div className="user-dashboard__profile">
          メモ一覧
        </div>
        <div className="user-dashboard__profile">
          プロフィール一覧
          <div className="" />
        </div>
        <div className="user-dashboard__profile">
          プロフィール作成
          <div className="user-dashboard__profile" />
        </div>
        <div className="user-dashboard__profile">
          メモ作成
        </div>
        <button className="btn btn-light w-100" onClick={onLogout}>
          ログアウト
        </button>
      </aside>

      <main className="flex-grow-1 p-4">
        <h1 className="h4">DashBoard</h1>
        <p className="text-muted">すでにログインしています。</p>

        <h2 className="h3 mt-4">投稿した記事一覧</h2>
      </main>
    </div>
  );
}
