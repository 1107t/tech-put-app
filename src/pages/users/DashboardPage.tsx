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

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(u);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="text-white p-3" style={{ width: 260, background: "#1f2937" }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="rounded-circle bg-secondary" style={{ width: 28, height: 28 }} />
          <div className="fw-bold">TecPutt</div>
        </div>

        <div className="user-dashboard__profile">
          <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
            {me.name}
          </Link>
          <div className="user-dashboard__divider" />
        </div>

        <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

        <nav className="d-grid gap-1">
          <Link className="btn btn-sm btn-dark text-start" to="/dashboard">
            記事一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/profiles">
            プロフィール一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/videos">
            動画投稿一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/tweets">
            つぶやき一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/inquiries">
            問い合わせ
          </Link>
        </nav>

        <button className="btn btn-light w-100 mt-3" onClick={handleLogout}>
          ログアウト
        </button>
      </aside>

      {/* Main */}
      <main className="flex-grow-1 bg-light">
        <div className="d-flex justify-content-end align-items-center p-3 border-bottom bg-white">
          <div className="rounded-circle bg-secondary" style={{ width: 28, height: 28 }} title="user" />
        </div>

        <div className="p-4">
          <h1 className="h4 mb-4">e-learning一覧</h1>

          <div className="d-grid gap-3" style={{ maxWidth: 640 }}>
            {lessons.map((l) => (
              <div key={l.id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="fw-bold">{l.title}</div>
                    {l.done && <span className="badge text-bg-secondary">完了</span>}
                  </div>

                  <div className="text-muted small mt-2">{l.category}</div>

                  <div className="mt-3">
                    <Link className="btn btn-primary btn-sm" to={`/lessons/${l.id}`}>
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
