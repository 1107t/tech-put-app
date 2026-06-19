// src/pages/admins/AdminUserTweetsPage.tsx【修正】
// 管理者側のユーザー別つぶやき一覧ページ。
// 指定ユーザーの投稿を閲覧でき、いいね・コメント機能を持つ。
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getUsers, type Admin } from "../../lib/adminApi";
import { getTweets, likeTweet, unlikeTweet, addComment } from "../../lib/tweetsStore";
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
  // 画面見出しに表示するユーザー名
  const [userName, setUserName] = useState<string>("");
  // 対象ユーザーのつぶやき一覧
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  // ツイート画像の表示用Object URL（tweetId → url[]）
  const [tweetImageUrls, setTweetImageUrls] = useState<Record<string, string[]>>({});
  // Object URLのキャッシュ。不要になったURLを正確に解放するためrefで管理する
  const urlsRef = useRef<Record<string, string[]>>({});

  // 管理者がいいねしたツイートIDのセット（ページリロードでリセット）
  const [likedTweetIds, setLikedTweetIds] = useState<Set<string>>(new Set());
  // コメント入力欄を開いているツイートのID（nullは全て閉じている状態）
  const [openCommentTweetId, setOpenCommentTweetId] = useState<string | null>(null);
  // 各ツイートのコメント入力テキスト（tweetId → 入力テキスト）
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

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

      // 対象ユーザーの名前を取得する
      const allUsers = await getUsers();
      if (cancelled) return;
      const targetUser = allUsers.find((user) => user.id === userId);
      setUserName(targetUser?.name ?? "不明なユーザー");

      // 全つぶやきから対象ユーザーの投稿のみ抽出する
      const allTweets = await getTweets();
      if (!cancelled) {
        const userTweets = allTweets.filter((tweet) => tweet.userId === userId);
        setTweets(userTweets);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, userId]);

  // ツイート一覧が変わるたびに画像のObject URLを差分更新する
  // 変化のないツイートは既存URLを再利用し、チラつきと不要なBlob再生成を防ぐ
  useEffect(() => {
    const previousUrls = urlsRef.current;
    const nextUrls: Record<string, string[]> = {};

    for (const tweet of tweets) {
      if (!tweet.images?.length) continue;
      if (previousUrls[tweet.id] && previousUrls[tweet.id].length === tweet.images.length) {
        // 画像枚数が同じなら既存URLを再利用してチラつきを防ぐ
        nextUrls[tweet.id] = previousUrls[tweet.id];
      } else {
        // 変化したツイートの旧URLを解放してから新規生成する
        previousUrls[tweet.id]?.forEach((url) => URL.revokeObjectURL(url));
        nextUrls[tweet.id] = tweet.images.map((blob) => URL.createObjectURL(blob));
      }
    }
    // 一覧から消えたツイートのURLを解放する
    for (const id of Object.keys(previousUrls)) {
      if (!nextUrls[id]) previousUrls[id].forEach((url) => URL.revokeObjectURL(url));
    }
    urlsRef.current = nextUrls;
    setTweetImageUrls(nextUrls);
  }, [tweets]);

  // アンマウント時にすべてのObject URLを解放してメモリリークを防ぐ
  useEffect(() => {
    return () => {
      Object.values(urlsRef.current).flat().forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  // いいねをトグルする: 未いいね→カウント+1、いいね済み→カウント-1
  const handleLikeToggle = async (tweetId: string) => {
    const isLiked = likedTweetIds.has(tweetId);
    if (isLiked) {
      await unlikeTweet(tweetId);
      // いいね済みセットから削除する
      setLikedTweetIds((previous) => {
        const next = new Set(previous);
        next.delete(tweetId);
        return next;
      });
    } else {
      await likeTweet(tweetId);
      // いいね済みセットに追加する
      setLikedTweetIds((previous) => new Set(previous).add(tweetId));
    }
    // IndexedDBから最新状態を再取得してカウントを画面に反映する
    const allTweets = await getTweets();
    setTweets(allTweets.filter((tweet) => tweet.userId === userId));
  };

  // コメントを投稿する: 空文字は無視し、投稿後に入力欄をクリアして一覧を更新する
  const handleCommentSubmit = async (tweetId: string) => {
    const text = commentInputs[tweetId]?.trim();
    if (!text) return;
    await addComment(tweetId, text);
    // 投稿済みの入力欄をクリアする
    setCommentInputs((previous) => ({ ...previous, [tweetId]: "" }));
    // IndexedDBから最新状態を再取得してコメント数を反映する
    const allTweets = await getTweets();
    setTweets(allTweets.filter((tweet) => tweet.userId === userId));
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
        <h4 className="mb-0">{userName}のつぶやき一覧</h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {/* つぶやき一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
      {tweets.length === 0 ? (
        <p className="text-muted text-center py-5">つぶやきはまだありません</p>
      ) : (
        <div className="d-grid gap-3">
          {tweets.map((tweet) => {
            const isLiked = likedTweetIds.has(tweet.id);
            const likeCount = tweet.likes ?? 0;
            const commentCount = tweet.comments?.length ?? 0;
            const isCommentOpen = openCommentTweetId === tweet.id;

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

                  {/* つぶやき本文: 改行を保持して表示 */}
                  <p className="mb-2 tweets-page__body">{tweet.content}</p>

                  {/* 添付画像の表示: Object URLに変換してimg要素で表示する */}
                  {tweetImageUrls[tweet.id] && tweetImageUrls[tweet.id].length > 0 && (
                    <div className="tweets-page__image-grid mb-2">
                      {tweetImageUrls[tweet.id].map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`添付画像 ${index + 1}`}
                          className="tweets-page__tweet-image"
                        />
                      ))}
                    </div>
                  )}

                  {/* アクションボタン: コメント・いいね */}
                  <div className="d-flex gap-3">
                    {/* コメントボタン: クリックでコメント入力欄を開閉する */}
                    <button
                      className="tweets-page__action-btn"
                      onClick={() => setOpenCommentTweetId(isCommentOpen ? null : tweet.id)}
                    >
                      <span>💬</span>
                      <span>{commentCount}</span>
                    </button>
                    {/* いいねボタン: いいね済みのときはハートを赤く表示してカウントを増やす */}
                    <button
                      className={`tweets-page__action-btn${isLiked ? " tweets-page__action-btn--liked" : ""}`}
                      onClick={() => handleLikeToggle(tweet.id)}
                    >
                      <span>{isLiked ? "❤️" : "🤍"}</span>
                      <span>{likeCount}</span>
                    </button>
                  </div>

                  {/* コメントセクション: コメントボタンを押したときのみ表示 */}
                  {isCommentOpen && (
                    <div className="tweets-page__comment-section">
                      {/* 既存コメントの一覧表示 */}
                      {tweet.comments && tweet.comments.length > 0 && (
                        <div className="mb-3">
                          {tweet.comments.map((comment) => (
                            <div key={comment.id} className="tweets-page__comment-item">
                              <span>{comment.text}</span>
                              <span className="tweets-page__comment-date">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* コメント入力欄: Enterキーでも投稿できる */}
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="コメントを入力..."
                          value={commentInputs[tweet.id] ?? ""}
                          onChange={(event) =>
                            setCommentInputs((previous) => ({
                              ...previous,
                              [tweet.id]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            // Enterキーでもコメントを投稿できる
                            if (event.key === "Enter") handleCommentSubmit(tweet.id);
                          }}
                        />
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleCommentSubmit(tweet.id)}
                        >
                          投稿
                        </button>
                      </div>
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
