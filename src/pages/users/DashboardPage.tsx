// src/pages/users/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import "../../styles/pages/dashboard.css";
import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
  AvatarIcon
} from "../../components/Icons";


type Lesson = {
  id: string;
  title: string;
  category: string;
  done: boolean;
};

const lessons: Lesson[] = [
  { id: "1", title: "システム開発とは", category: "システム開発", done: true },
  { id: "2", title: "HTML_CSS編(1) 簡単なホームページを作ってみよう。", category: "HTML", done: true },
  { id: "3", title: "HTML_CSS編(2) 簡単なホームページを作ってみよう。", category: "CSS", done: true },
  { id: "4", title: "HTML_CSS編(3) 簡単なホームページを作ってみよう。", category: "HTML,CSS", done: true },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const goMyPage = () => {
    navigate(`/users/${me?.id}`);
  };

  const goDashboard = () => {
    navigate("/dashboard");
  };
  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser();
      console.log("currentUser:", u);

      if (!u) {
        navigate("/login", { replace: true });
        return;
      }

      setMe(u);
    };

    fetchUser();
  }, [navigate]);

    const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-secondary user-dashboard__sidebar_size" />
          <div className="fw-bold">TechPutt</div>
        </div>

        <div className="user-dashboard__profile">
          <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
            {me.name}
          </Link>
          <div className="user-dashboard__divider" />
        </div>

        <div className="small text-uppercase text-white-50 user-dashboard__nav-title">
          e-learning
        </div>

        <div className="user-dashboard__nav">
          <Link className="user-dashboard__nav-item" to="/memos">
            <GridIcon className="user-dashboard__nav-icon" size={18} />
            <span>記事一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles">
            <ListIcon className="user-dashboard__nav-icon" size={18} />
            <span>プロフィール一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles/new">
            <UserIcon className="user-dashboard__nav-icon" size={18} />
            <span>動画投稿一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/memos/new">
            <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
            <span>つぶやき一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/memos/new">
            <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
            <span>問い合わせ</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow-1 bg-light">
      <div className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
          <h1 className="h5 mb-0">投稿した記事一覧</h1>

          <div className="position-relative">
            <button
              className="btn p-0 border-0 bg-transparent"
              onClick={() => setOpen(!open)}
            >
              <AvatarIcon size={42}  />
            </button>

            {open && (
              <div className="dropdown-menu show position-absolute end-0 mt-2">
                <button className="dropdown-item" onClick={goDashboard}>
                  マイページ
                </button>
                <button className="dropdown-item" onClick={goDashboard}>
                  ダッシュボード
                </button>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          <h1 className="h4 mb-4">e-learning一覧</h1>

          <div className="d-grid gap-3 user-dashboard__content">
            {lessons.map((l) => (
              <div key={l.id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="fw-bold">{l.title}</div>
                    {l.done && (
                      <span className="badge text-bg-secondary">完了</span>
                    )}
                  </div>

                  <div className="text-muted small mt-2">{l.category}</div>

                  <div className="mt-3">
                    <Link
                      className="btn btn-primary btn-sm"
                      to={`/lessons/${l.id}`}
                    >
                      記事を見る
                    </Link>
                  </div>
                </div>
              </div>
            ))}
           </div>
        </div>

      </main>
    </div>
  );
}
