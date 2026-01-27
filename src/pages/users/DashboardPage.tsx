// src/pages/users/DashboardPage.tsx
import { Link, useNavigate } from "react-router-dom";
import "../../styles/pages/dashboard.css";
import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
} from "../../components/Icons";

export default function DashboardPage() {
  const nav = useNavigate();

  const onLogout = () => {
    nav("/login", { replace: true });
  };

  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        <div className="fw-bold mb-3">ネイテク</div>

        <div className="user-dashboard__profile">
          <span>test_user</span>
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

        <button className="btn btn-light w-100 mt-3" onClick={onLogout}>
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
