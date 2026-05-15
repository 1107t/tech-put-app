// src/pages/users/tweet/Index.tsx【修正】
// つぶやき一覧ページ。投稿・編集・削除・フラッシュメッセージを管理する。
// Rails-style に合わせ tweet/ ディレクトリの Index として配置。
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRequireAuth } from "../../../lib/useRequireAuth";
import { createTweet, deleteTweet, getTweets, updateTweet } from "../../../lib/tweetsStore";
import type { Tweet } from "../../../lib/tweets";
import UserLayout from "../../../components/user/UserLayout";
import { dashboardMenu } from "../../../lib/userMenus";
import "../../../styles/pages/tweets.css";

// フラッシュメッセージの型（成功=緑 / エラー=赤）
type Flash = {
  type: "success" | "error"; // 表示色の種別
  message: string;           // 表示するメッセージ内容
};

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

export default function TweetIndex() {
  // useRequireAuth が認証チェック・未ログイン時リダイレクトを担当（UserLayout 内と同一フック）
  const { me } = useRequireAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);          // つぶやき一覧
  const [content, setContent] = useState("");                 // 投稿フォームの入力内容
  const [flash, setFlash] = useState<Flash | null>(null);     // フラッシュメッセージ
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // フラッシュ自動消去タイマー
  const [editingId, setEditingId] = useState<string | null>(null); // 編集中のつぶやきID（null=編集していない）
  const [editContent, setEditContent] = useState(""); // 編集中の本文テキスト

  // me が確定してからつぶやき一覧を取得する（me が null の間はスキップ）
  useEffect(() => {
    if (!me) return;
    (async () => setTweets(await getTweets()))();
  }, [me]);

  // フラッシュメッセージを表示し、3秒後に自動消去する
  const showFlash = (type: Flash["type"], message: string) => {
    setFlash({ type, message });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlash(null), 3000);
  };

  // 編集ボタン押下: 対象ツイートの内容をセットしてインライン編集モードへ
  const handleEditStart = (tweet: Tweet) => {
    setEditingId(tweet.id);
    setEditContent(tweet.content);
  };

  const handleEditSave = async (id: string) => {
    if (!editContent.trim()) {
      showFlash("error", "内容を入力してください");
      return;
    }
    await updateTweet(id, editContent.trim());
    setEditingId(null);
    setTweets(await getTweets());
    showFlash("success", "つぶやきを更新しました。");
  };

  const handleDelete = async (id: string) => {
    await deleteTweet(id);
    setTweets(await getTweets());
    showFlash("success", "つぶやきを削除しました。");
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showFlash("error", "投稿内容を入力してください");
      return;
    }
    if (!me) return;

    const tweet: Tweet = {
      id: uuidv4(),
      userId: me.id,
      userName: me.name,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    await createTweet(tweet);
    setContent("");
    setTweets(await getTweets());
    showFlash("success", "つぶやきを作成しました。");
  };

  return (
    <UserLayout menu={dashboardMenu} headerTitle="つぶやき一覧">
      {flash && (
        <div
          className={`alert mb-3 py-2 px-4 ${
            flash.type === "success" ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {flash.message}
        </div>
      )}

      {/* コンテンツ幅を680pxに制限し中央寄せ */}
      <div className="tweets-page__content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">つぶやき一覧</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm">並べ替え</button>
            <button className="btn btn-outline-secondary btn-sm">絞り込み検索</button>
          </div>
        </div>

        {tweets.length === 0 ? (
          <p className="text-muted text-center py-5">つぶやきはまだありません</p>
        ) : (
          <div className="d-grid gap-3">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="card shadow-sm tweets-page__tweet-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex gap-2 align-items-center">
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
                    {me && tweet.userId === me.id && editingId !== tweet.id && (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleEditStart(tweet)}
                        >
                          編集
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(tweet.id)}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === tweet.id ? (
                    <div className="mb-2">
                      <textarea
                        className="form-control mb-1"
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          キャンセル
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleEditSave(tweet.id)}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 本文: 改行を保持して表示 */
                    <p className="mb-2 tweets-page__body">{tweet.content}</p>
                  )}

                  <div className="d-flex gap-3">
                    <button className="tweets-page__action-btn">
                      <span>💬</span>
                      <span>0</span>
                    </button>
                    <button className="tweets-page__action-btn">
                      <span>🤍</span>
                      <span>0</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card shadow-sm tweets-page__form-card mt-4">
          <div className="card-body">
            <textarea
              className="form-control mb-2"
              rows={3}
              placeholder="つぶやく内容を入力してください..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
            />
            <div className="d-flex justify-content-end">
              <button className="btn btn-success btn-sm px-4" onClick={handleSubmit}>
                投稿する
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
