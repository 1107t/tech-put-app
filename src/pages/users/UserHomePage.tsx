// src/pages/users/UserHomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { findUserById, getCurrentUserId } from "../../lib/usersStore";
import type { User } from "../../lib/users";

export default function UserHomePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const meId = await getCurrentUserId();
      if (!meId) return nav("/login", { replace: true });

      if (!id) return nav("/dashboard", { replace: true });

      const u = await findUserById(id);
      if (!u) return nav("/dashboard", { replace: true });

      setUser(u);
    })();
  }, [id, nav]);

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: 900, margin: "30px auto" }}>
      <h1 className="h3">ユーザー専用ページ</h1>

      <div className="mt-3">
        {/* ✅ ここでユーザー名をクリック → 詳細へ */}
        <div className="mb-3">
          <Link to={`/users/${user.id}/detail`} className="fw-bold">
            {user.name}
          </Link>
        </div>

        <div className="d-flex gap-3">
          <Link to={`/users/${user.id}/posts`} className="btn btn-success">
            投稿した記事一覧
          </Link>
          <Link to={`/users/${user.id}/videos`} className="btn btn-warning">
            投稿した動画一覧
          </Link>
        </div>

        <div className="mt-4">
          <Link to="/dashboard" className="btn btn-secondary">
            ダッシュボードへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
