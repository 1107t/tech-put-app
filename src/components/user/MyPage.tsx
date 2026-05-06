import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import { AvatarIcon } from "../../components/Icons";

export default function MyPage() {
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return nav("/login", { replace: true });
      setMe(u);
    })();
  }, [nav]);

  if (!me) return null;

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="card shadow" style={{ width: "420px" }}>
        {/* タイトル */}
        <div className="card-header text-center fw-bold fs-5">
          ユーザー詳細画面
        </div>

        <div className="card-body">

          {/* Avatar */}
          <div className="text-center mb-4">
            <AvatarIcon size={120} />
          </div>

          {/* 名前 */}
          <div className="mb-3 border-bottom pb-2">
            <small className="text-muted">名前</small>
            <div className="fw-semibold">{me.name}</div>
          </div>

          {/* メール */}
          <div className="mb-3 border-bottom pb-2">
            <small className="text-muted">メールアドレス</small>
            <div>{me.email}</div>
          </div>

          {/* 性別 */}
          <div className="mb-3 border-bottom pb-2">
            <small className="text-muted">性別</small>
            <div>{me.gender}</div>
          </div>

          {/* 誕生日 */}
          <div className="mb-3 border-bottom pb-2">
            <small className="text-muted">生年月日</small>
            <div>{me.birthday}</div>
          </div>

          {/* 学習開始日 */}
          <div className="mb-3 border-bottom pb-2">
            <small className="text-muted">学習開始日</small>
            <div>
              {new Date(me.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* 学習目的 */}
          <div className="mb-4">
            <small className="text-muted">学習目的</small>
            <div>{me.goal || "ー"}</div>
          </div>

          {/* ボタン */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-success"
              onClick={() => nav(`/users/${me.id}/posts`)}
            >
              投稿した記事一覧
            </button>

            <button
              className="btn btn-warning"
              onClick={() => nav(`/users/${me.id}/videos`)}
            >
              投稿した動画一覧
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
