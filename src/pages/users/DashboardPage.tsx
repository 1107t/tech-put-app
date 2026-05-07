// src/pages/users/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import "../../styles/pages/dashboard.css";
import UserLayout from "../../components/user/UserLayout";

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
    <UserLayout me={me} onLogout={handleLogout}>
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
    </UserLayout>
  );
}
