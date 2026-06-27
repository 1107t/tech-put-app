// src/pages/admins/AdminUserTweetsPage.tsx【修正】
// 管理者側のユーザー別つぶやき一覧ページ。
// IndexedDB から Rails API に移行したことで、管理者が他ユーザーのつぶやきを閲覧できるようになった。
// 管理者は user_id を持たないため、いいね・コメント投稿は提供せず閲覧専用とする。
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getAdminUserTweets, type Admin } from "../../lib/adminApi";
import type { Tweet } from "../../lib/tweets";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../styles/pages/tweets.css";

// ISO形式の日時文字列を「YYYY年MM月DD日 HH:mm」形式に変換するユーティリティ
function formatDate(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0始まりのため+1
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

export default function AdminUserTweetsPage() {
  const navigate = useNavigate();
  // URLパラメータからユーザーIDを取得する
  const { userId } = useParams<{ userId: string }>();

  const [admin, setAdmin] = useState<Admin | null>(null);
  // 画面見出しに使うユーザー名（APIレスポンスの最初のツイートから取得する）
  const [userName, setUserName] = useState<string>("");
  // 対象ユーザーのつぶやき一覧（Rails DB から取得）
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 管理者ログイン確認。未ログインならログインページへリダイレクトする
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);

      if (!userId) return;

      try {
        // 管理者専用エンドポイントからユーザーのつぶやきを取得する
        // IndexedDB と異なり Rails DB のデータを返すため他ユーザーの投稿も取得できる
        const userTweets = await getAdminUserTweets(userId);
        if (cancelled) return;
        setTweets(userTweets);
        // ユーザー名はツイートの userName フィールドから取得する
        if (userTweets.length > 0) {
          setUserName(userTweets[0].userName);
        }
      } catch {
        if (!cancelled) setError("つぶやきの取得に失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, userId]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* ページヘッダー: ユーザー名 + 並べ替え・絞り込みボタン */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">
          {userName ? `${userName}のつぶやき一覧` : "つぶやき一覧"}
        </h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* つぶやき一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
      {tweets.length === 0 ? (
        <p className="text-muted text-center py-5">つぶやきはまだありません</p>
      ) : (
        <div className="d-grid gap-3">
          {tweets.map((tweet) => {
            const likeCount = tweet.likesCount ?? 0;
            const commentCount = tweet.comments?.length ?? 0;

            return (
              <div key={tweet.id} className="card shadow-sm tweets-page__tweet-card">
                <div className="card-body">
                  {/* カードヘッダー: アバター・ユーザー名・投稿日時 */}
                  <div className="d-flex align-items-start mb-2">
                    <div className="d-flex gap-2 align-items-center">
                      {/* アバター（画像未実装のため背景色で代替） */}
                      <div className="tweets-page__avatar" />
                      <div>
                        {/* ユーザー名 */}
                        <div className="fw-bold tweets-page__user-name">{tweet.userName}</div>
                        {/* 投稿日時 */}
                        <div className="text-muted tweets-page__date">
                          {formatDate(tweet.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* つぶやき本文 */}
                  <p className="mb-2 tweets-page__body">{tweet.content}</p>

                  {/* 添付画像の表示: Active Storage の URL を img 要素で直接表示する */}
                  {tweet.imageUrls && tweet.imageUrls.length > 0 && (
                    <div className="tweets-page__image-grid mb-2">
                      {tweet.imageUrls.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`添付画像 ${index + 1}`}
                          className="tweets-page__tweet-image"
                        />
                      ))}
                    </div>
                  )}

                  {/* いいね数・コメント数の表示（管理者は閲覧のみ。投稿ボタンは提供しない） */}
                  <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.875rem" }}>
                    <span>💬 {commentCount}</span>
                    <span>🤍 {likeCount}</span>
                  </div>

                  {/* コメント一覧の表示 */}
                  {tweet.comments && tweet.comments.length > 0 && (
                    <div className="tweets-page__comment-section">
                      {tweet.comments.map((comment) => (
                        <div key={comment.id} className="tweets-page__comment-item">
                          <span>
                            <span className="fw-bold me-2">{comment.userName}</span>
                            {comment.content}
                          </span>
                          <span className="tweets-page__comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
