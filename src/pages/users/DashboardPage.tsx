// src/pages/users/DashboardPage.tsx【修正】
// e-learning コンテンツ一覧ページ。
// UserLayout に認証・サイドバー・ヘッダーを委譲し、コンテンツのみ記述する。
import { Link } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { dashboardMenu } from "../../components/user/UserLayout";
import "../../styles/pages/dashboard.css";

// レッスン情報の型定義
type Lesson = {
  id: string;     // レッスンID
  title: string;  // レッスンタイトル
  category: string; // カテゴリ名
  done: boolean;  // 完了フラグ
};

// 表示するレッスン一覧（将来的にはAPIから取得する想定）
const lessons: Lesson[] = [
  { id: "1", title: "システム開発とは", category: "システム開発", done: true },
  { id: "2", title: "HTML_CSS編(1) 簡単なホームページを作ってみよう。", category: "HTML", done: true },
  { id: "3", title: "HTML_CSS編(2) 簡単なホームページを作ってみよう。", category: "CSS", done: true },
  { id: "4", title: "HTML_CSS編(3) 簡単なホームページを作ってみよう。", category: "HTML,CSS", done: true },
];

export default function DashboardPage() {
  // UserLayout が認証チェック・リダイレクト・サイドバー・ヘッダーをすべて担当する
  // render-prop の me はこのページでは使用しないため _ で受け取る
  return (
    <UserLayout menu={dashboardMenu} headerTitle="e-learning一覧">
      {(_me) => (
        <>
          <h1 className="h4 mb-4">e-learning一覧</h1>

          {/* レッスンカード一覧 */}
          <div className="d-grid gap-3" style={{ maxWidth: 640 }}>
            {lessons.map((lesson) => (
              <div key={lesson.id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between">
                    {/* レッスンタイトル */}
                    <div className="fw-bold">{lesson.title}</div>
                    {/* 完了バッジ */}
                    {lesson.done && <span className="badge text-bg-secondary">完了</span>}
                  </div>

                  {/* カテゴリ名 */}
                  <div className="text-muted small mt-2">{lesson.category}</div>

                  {/* 記事を見るボタン */}
                  <div className="mt-3">
                    <Link className="btn btn-primary btn-sm" to={`/lessons/${lesson.id}`}>
                      記事を見る
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </UserLayout>
  );
}
