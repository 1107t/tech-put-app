// src/pages/admins/AdminUserTweetsPage.tsx【修正】
// 管理者側のユーザー別つぶやき一覧ページ。
// IndexedDB から Rails API に移行したことで、管理者が他ユーザーのつぶやきを閲覧できるようになった。
// 管理者は user_id を持たないため、いいね・コメント投稿は提供せず閲覧専用とする。
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getAdminUserTweets, getUser, type Admin } from "../../lib/adminApi";
import type { Tweet } from "../../lib/tweets";
import AdminLayout from "../../components/admin/AdminLayout";
// 日付整形はページ内の重複実装を廃止し、共通ユーティリティ formatDate を使う（DRY原則）
import { formatDate } from "../../lib/formatDate";
// 【修正】ページ全体の読み込みに失敗したときの、本文に代わる恒久的なエラー表示。
// このページは閲覧専用で操作を持たないため、通知はこれだけでよく、フラッシュメッセージは使わない
import PageError from "../../components/admin/PageError";
import type { LoadStatus } from "../../lib/loadStatus";
import "../../styles/pages/tweets.css";

export default function AdminUserTweetsPage() {
  const navigate = useNavigate();
  // URLパラメータからユーザーIDを取得する
  const { userId } = useParams<{ userId: string }>();

  const [admin, setAdmin] = useState<Admin | null>(null);
  // 画面見出しに使うユーザー名（getUser で取得。つぶやき0件でも表示できる）
  const [userName, setUserName] = useState<string>("");
  // 対象ユーザーのつぶやき一覧（Rails DB から取得）
  const [tweets, setTweets] = useState<Tweet[]>([]);

  // 【修正】ページ全体の読み込み状態。
  // 「読み込み中」と「失敗」を別々の boolean で持つと、失敗を表示しないまま
  // 空状態のメッセージ（＝0件と断定する文言）を出してしまう事故が起きる。
  // 1つの状態にまとめ、描画側で failed の分岐を必ず書くようにしている
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 管理者ログイン確認。未ログインならログインページへリダイレクトする。
        // 【修正】getCurrentAdmin は 401 のときだけ null を返し、500・タイムアウト・通信断では throw する。
        // try の外に置くと throw を捕まえられず、スピナーが回り続けるため必ず try の中で呼ぶ
        const currentAdmin = await getCurrentAdmin();
        if (cancelled) return;
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdmin(currentAdmin);

        // 【修正】URLにユーザーIDが無ければ取得しようがないので、失敗として扱う（読み込み中のまま止めない）
        if (!userId) {
          if (!cancelled) setLoadStatus("failed");
          return;
        }

        // ユーザー情報とつぶやき一覧を並列取得する
        // ユーザー名はつぶやき0件でも表示できるようユーザー情報から取得する
        const [userInfo, userTweets] = await Promise.all([
          getUser(userId),
          getAdminUserTweets(userId),
        ]);
        if (cancelled) return;
        setUserName(userInfo.name);
        setTweets(userTweets);
        setLoadStatus("loaded");
      } catch {
        // 【修正】ログイン確認・ユーザー情報・つぶやきのいずれの失敗もここに来る。
        // 失敗の表示は PageError が担うので、ここでは状態を立てるだけでよい
        if (!cancelled) setLoadStatus("failed");
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

  if (loadStatus === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  // 【修正】取得に失敗したときは、本文の代わりにエラー画面を出す。
  // フラッシュは3秒で消えるため、失敗した状態を伝え続ける役割はこちらが担う
  if (loadStatus === "failed") {
    return <PageError message="データを取得できませんでした。" />;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* ページヘッダー: ユーザー名 + 並べ替え・絞り込みボタン */}
      <div className="d-flex align-items-center gap-3 mb-4">
        {/* 【修正】このページだけ「さん」が付かないのは揃え忘れではなく現状維持の判断。
            提出済みの画面遷移図（PR #24）に「◯◯のつぶやき一覧」と描かれているため、
            記事一覧・動画投稿一覧で使っている buildUserPageHeading（「◯◯さんの〜」）には寄せていない。
            文言の統一は、資料の差し替えとセットで行うこと。
            名前が取得できなかったときだけは「のつぶやき一覧」になるのを避け、一般名に倒す */}
        <h4 className="mb-0">
          {userName ? `${userName}のつぶやき一覧` : "受講生のつぶやき一覧"}
        </h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {/* つぶやき一覧: 投稿がなければ空メッセージ、あればカード形式で表示。
          【修正】取得失敗はこの手前で PageError に分岐済みなので、ここは成功時だけを考えればよい */}
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
