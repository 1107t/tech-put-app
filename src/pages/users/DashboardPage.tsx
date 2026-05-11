import { Link } from "react-router-dom";
import { dashboardMenu } from "../../lib/userMenus";
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
      </div>
    </UserLayout>
  );
}
