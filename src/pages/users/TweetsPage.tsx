// src/pages/users/TweetsPage.tsx
// つぶやき機能のメインページ。投稿フォームとつぶやき一覧を表示する。
// 未ログイン時は /login にリダイレクトする認証ガード付き。
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser, logout } from "../../lib/usersStore";
import { createTweet, deleteTweet, getTweets, updateTweet } from "../../lib/tweetsStore";
import type { User } from "../../lib/users";
import type { Tweet } from "../../lib/tweets";
import "../../styles/pages/tweets.css";

// フラッシュメッセージの型（成功=緑 / エラー=赤）
type Flash = { type: "success" | "error"; message: string };

// ISO形式の日時文字列を「YYYY年MM月DD日 HH:mm」形式に変換するユーティリティ
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}年${mo}月${day}日 ${h}:${min}`;
}

export default function TweetsPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [content, setContent] = useState("");
  const [flash, setFlash] = useState<Flash | null>(null);
  // フラッシュメッセージの自動消去タイマーを管理するref（再レンダリング不要のためuseRefで保持）
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // インライン編集中のつぶやきID（null=編集していない）
  const [editingId, setEditingId] = useState<string | null>(null);
  // 編集中の本文テキスト
  const [editContent, setEditContent] = useState("");

  // マウント時: ログイン状態を確認し、未ログインなら /login へリダイレクト
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(u);
      setTweets(await getTweets());
    })();
  }, [navigate]);

  // フラッシュメッセージを表示し、3秒後に自動消去する
  const showFlash = (type: Flash["type"], message: string) => {
    setFlash({ type, message });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlash(null), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // 編集ボタン押下: 対象ツイートの本文をeditContentにセットしてインライン編集モードへ
  const handleEditStart = (t: { id: string; content: string }) => {
    setEditingId(t.id);
    setEditContent(t.content);
  };

  // 編集確定: 空文字はエラー、成功時はストア更新して一覧再取得
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

  // 削除ボタン押下: ストアから削除して一覧を再取得
  const handleDelete = async (id: string) => {
    await deleteTweet(id);
    setTweets(await getTweets());
    showFlash("success", "つぶやきを削除しました。");
  };

  // 投稿ボタン押下時の処理
  // 空文字はバリデーションエラー、成功時はIndexedDBに保存して一覧を再取得する
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
    // 保存後にストレージから再取得することで、他タブで追加された投稿も反映できる
    setTweets(await getTweets());
    showFlash("success", "つぶやきを作成しました。");
  };

  // ログインユーザーの取得が完了するまで何も描画しない
  if (!me) return null;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="text-white p-3" style={{ width: 260, background: "#1f2937" }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="rounded-circle bg-secondary" style={{ width: 28, height: 28 }} />
          <div className="fw-bold">TecPutt</div>
        </div>

        <div className="mb-3">
          <span className="text-white fw-bold">{me.name}</span>
          <div style={{ height: 2, background: "red", marginTop: 8 }} />
        </div>

        <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

        <nav className="d-grid gap-1">
          <Link className="btn btn-sm btn-dark text-start" to="/dashboard">記事一覧</Link>
          <Link className="btn btn-sm btn-dark text-start" to="/profiles">プロフィール一覧</Link>
          <Link className="btn btn-sm btn-dark text-start" to="/videos">動画投稿一覧</Link>
          {/* 現在のページをハイライト表示する */}
          <Link className="btn btn-sm btn-dark text-start" to="/tweets" style={{ background: "#374151" }}>
            つぶやき一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/inquiries">問い合わせ</Link>
        </nav>

        <button className="btn btn-light w-100 mt-3" onClick={handleLogout}>
          ログアウト
        </button>
      </aside>

      {/* Main */}
      <main className="flex-grow-1 bg-light d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-end align-items-center p-3 border-bottom bg-white">
          <div
            className="rounded-circle bg-secondary"
            style={{ width: 28, height: 28 }}
            title={me.name}
          />
        </div>

        {/* フラッシュメッセージ: 成功=緑(alert-success) / エラー=赤(alert-danger) */}
        {flash && (
          <div
            className={`alert mb-0 rounded-0 py-2 px-4 ${
              flash.type === "success" ? "alert-success" : "alert-danger"
            }`}
            role="alert"
          >
            {flash.message}
          </div>
        )}

        {/* コンテンツ幅を680pxに制限し、margin: "0 auto" で画面中央に配置する */}
        <div className="p-4" style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
          {/* 一覧ヘッダー（並べ替え・絞り込みボタンはUI表示のみ、機能は未実装） */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">つぶやき一覧</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm">並べ替え</button>
              <button className="btn btn-outline-secondary btn-sm">絞り込み検索</button>
            </div>
          </div>

          {/* つぶやき一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
          {tweets.length === 0 ? (
            <p className="text-muted text-center py-5">つぶやきはまだありません</p>
          ) : (
            <div className="d-grid gap-3">
              {tweets.map((t) => (
                <div key={t.id} className="card shadow-sm tweets-page__tweet-card">
                  <div className="card-body">
                    {/* カードヘッダー: アバター / ユーザー名・投稿日時 / メニューボタン */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex gap-2 align-items-center">
                        <div className="tweets-page__avatar" />
                        <div>
                          <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{t.userName}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {formatDate(t.createdAt)}
                          </div>
                        </div>
                      </div>
                      {/* 自分の投稿にのみ編集・削除ボタンを直接表示する */}
                      {t.userId === me.id && editingId !== t.id && (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEditStart(t)}
                          >
                            編集
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(t.id)}
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 本文: 編集中はテキストエリアを表示、通常時はテキスト表示 */}
                    {editingId === t.id ? (
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
                            onClick={() => handleEditSave(t.id)}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mb-2" style={{ whiteSpace: "pre-wrap" }}>{t.content}</p>
                    )}

                    {/* アクションボタン: コメント数・いいね数（現状は0固定、将来の拡張用） */}
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

          {/* 投稿フォーム: 履歴の下に配置 */}
          <div className="card shadow-sm tweets-page__form-card mt-4">
            <div className="card-body">
              {/* Cmd+Enter（Mac）/ Ctrl+Enter（Windows）でも投稿できるようにする */}
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
      </main>
    </div>
  );
}
