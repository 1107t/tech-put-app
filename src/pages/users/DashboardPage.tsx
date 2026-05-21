<<<<<<< HEAD
// src/pages/users/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import UserLayout from "../../components/user/UserLayout";
import "../../styles/pages/dashboard.css";
=======
import { Link } from "react-router-dom";
import { dashboardMenu } from "../../lib/userMenus";
import "../../styles/pages/dashboard.css";
import UserLayout from "../../components/user/UserLayout";
>>>>>>> 2b73daa9406bf5a7668212a6da024ba1aaf99b4d

type Lesson = {
  id: string;
  title: string;
  category: string;
  done: boolean;
};

const lessons: Lesson[] = [
  { id: "1", title: "システム開発とは", category: "システム開発", done: true },
  { id: "2", title: "HTML_CSS編(1)", category: "HTML", done: true },
  { id: "3", title: "HTML_CSS編(2)", category: "CSS", done: true },
  { id: "4", title: "HTML_CSS編(3)", category: "HTML,CSS", done: true },
];

export default function DashboardPage() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);

  const goMyPage = () => {
    navigate(`/users/${me?.id}`);
  };

  const goDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return navigate("/login", { replace: true });
      setMe(u);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <UserLayout
      me={me}
      variant="dashboard"
      onMyPage={goMyPage}
      onDashboard={goDashboard}
      onLogout={handleLogout}
      title="投稿した記事一覧"
    >
      <div className="p-4">
        <h1 className="h4 mb-4">e-learning一覧</h1>

        <div className="d-grid gap-3 user-dashboard__content">
          {lessons.map((l) => (
            <div key={l.id} className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between">
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
=======
  return (
    <UserLayout menu={dashboardMenu}>
      <h1 className="h4 mb-4">e-learning一覧</h1>

      <div className="d-grid gap-3 lesson-list">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between">
                <div className="fw-bold">{lesson.title}</div>
                {lesson.done && <span className="badge text-bg-secondary">完了</span>}
              </div>

              <div className="text-muted small mt-2">{lesson.category}</div>

              <div className="mt-3">
                <Link className="btn btn-primary btn-sm" to={`/lessons/${lesson.id}`}>
                  記事を見る
                </Link>
              </div>
            </div>
          </div>
        ))}
>>>>>>> 2b73daa9406bf5a7668212a6da024ba1aaf99b4d
      </div>
    </UserLayout>
  );
}
