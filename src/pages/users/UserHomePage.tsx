import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
} from "../../components/Icons"; //

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


  const goDashboard = () => {
    nav("/dashboard", { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        <div className="fw-bold mb-3">TechPutt</div>

        <div className="user-dashboard__profile">
          <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
            {me.name}
          </Link>
          <div className="user-dashboard__divider" />
        </div>

        <div className="user-dashboard__nav">
          <Link className="user-dashboard__nav-item" to="/memos">
            <GridIcon className="user-dashboard__nav-icon" size={18} />
            <span>メモ一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles">
            <ListIcon className="user-dashboard__nav-icon" size={18} />
            <span>プロフィール一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles/new">
            <UserIcon className="user-dashboard__nav-icon" size={18} />
            <span>プロフィール作成</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/memos/new">
            <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
            <span>メモ作成</span>
          </Link>
        </div>

      </aside>

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-left align-items-center mb-5 p-3 bg-white gap-3">
          <button className="btn btn-m text-gray-100 p-0" onClick={goDashboard}>
            Dashboard
          </button>

          <button className="btn btn-m text-gray-100 p-0" onClick={handleLogout}>
            ログアウト
          </button>
        </div>

        <h1 className="h4">DashBoard</h1>
        <p className="text-muted">すでにログインしています。</p>

        <h2 className="h3 mt-4">投稿した記事一覧</h2>

              <div className="border-top border-bottom py-3 d-flex justify-content-between">
        <div className="fw-bold" style={{ width: "35%" }}>
          タイトル
        </div>
        <div className="fw-bold" style={{ width: "35%" }}>
          サブタイトル
        </div>
        <div className="fw-bold text-end" style={{ width: "30%" }}>
          投稿日
        </div>
      </div>
      </main>
    </div>
  );
}
