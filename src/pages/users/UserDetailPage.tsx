// src/pages/users/UserDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findUserById, getCurrentUserId } from "../../lib/usersStore";
import { genderLabel, type User } from "../../lib/users";

export default function UserDetailPage() {
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
    <div className="container" style={{ maxWidth: 720, margin: "30px auto" }}>
      <h1 className="h3 text-center">ユーザー詳細画面</h1>

      <div className="text-center my-3">
        <div className="border rounded-pill d-inline-block px-4 py-2">画像</div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 360 }}>
        <div className="mb-3">
          <div className="small text-muted">名前</div>
          <div className="fw-semibold">{user.name}</div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">メールアドレス</div>
          <div className="fw-semibold">{user.email}</div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">性別</div>
          <div className="fw-semibold">{genderLabel(user.gender)}</div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">生年月日</div>
          <div className="fw-semibold">{user.birthday}</div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => nav(`/users/${user.id}`)}>
          ユーザー専用ページへ戻る
        </button>
      </div>
    </div>
  );
}
