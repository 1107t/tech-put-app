// 受講生別のつぶやきを表示する。管理者はuser_idを持たないため閲覧専用とする。
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdminUserTweets, getUser } from "../../lib/adminApi";
import type { Tweet } from "../../lib/tweets";
import AdminLayout from "../../components/admin/AdminLayout";
import { formatDate } from "../../lib/formatDate";
import PageError from "../../components/admin/PageError";
import type { LoadStatus } from "../../lib/loadStatus";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import PageSpinner from "../../components/admin/PageSpinner";
import "../../styles/pages/tweets.css";

export default function AdminUserTweetsPage() {
  const { userId } = useParams<{ userId: string }>();

  const { admin, loading: authenticationLoading, error: authenticationError, handleLogout } = useRequireAdmin();
  const [userName, setUserName] = useState<string>("");
  const [tweets, setTweets] = useState<Tweet[]>([]);

  // 取得失敗を「投稿0件」と表示しないよう、読み込み状態を区別する。
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    if (!admin) return;
    // ユーザー切り替え後や離脱後に古い取得結果を反映しない。
    let cancelled = false;
    setLoadStatus("loading");
    (async () => {
      try {
        if (!userId) {
          if (!cancelled) setLoadStatus("failed");
          return;
        }

        // 投稿0件でも氏名を表示できるよう、ユーザー情報を別途取得する。
        const [userInfo, userTweets] = await Promise.all([
          getUser(userId),
          getAdminUserTweets(userId),
        ]);
        if (cancelled) return;
        setUserName(userInfo.name);
        setTweets(userTweets);
        setLoadStatus("loaded");
      } catch {
        if (!cancelled) setLoadStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [admin, userId]);

  // 認証失敗時にスピナーが残らないよう、読み込み中より先に判定する。
  if (authenticationError || loadStatus === "failed") {
    return <PageError message="データを取得できませんでした。" />;
  }

  if (authenticationLoading || loadStatus === "loading") return <PageSpinner />;

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* 提出済みの遷移図に合わせ、つぶやき一覧の見出しには敬称を付けない。 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">
          {userName ? `${userName}のつぶやき一覧` : "受講生のつぶやき一覧"}
        </h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {/* つぶやき一覧 */}
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
                  {/* 投稿者と投稿日時 */}
                  <div className="d-flex align-items-start mb-2">
                    <div className="d-flex gap-2 align-items-center">
                      <div className="tweets-page__avatar" />
                      <div>
                        <div className="fw-bold tweets-page__user-name">{tweet.userName}</div>
                        <div className="text-muted tweets-page__date">
                          {formatDate(tweet.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 本文・添付画像 */}
                  <p className="mb-2 tweets-page__body">{tweet.content}</p>

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

                  {/* 管理者には件数とコメントの閲覧のみ提供する。 */}
                  <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.875rem" }}>
                    <span>💬 {commentCount}</span>
                    <span>🤍 {likeCount}</span>
                  </div>

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
