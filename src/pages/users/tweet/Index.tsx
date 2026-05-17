// src/pages/users/tweet/Index.tsx【修正】
// つぶやき一覧ページ。ヘッダーの「つぶやき投稿」ボタンでモーダルを開き投稿する。
// UserLayout の render-prop から me を受け取るため、useRequireAuth の二重呼び出しを解消している。
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createTweet, deleteTweet, getTweets, updateTweet } from "../../../lib/tweetsStore";
import type { User } from "../../../lib/users";
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

// TweetIndex から受け取る props の型
type TweetsContentProps = {
  me: User;                  // ログイン中ユーザー（UserLayout で認証済み）
  isModalOpen: boolean;      // 投稿モーダルの表示状態
  onModalClose: () => void;  // モーダルを閉じるコールバック
};

// UserLayout の render-prop から me を受け取り、つぶやき一覧・モーダル投稿・編集・削除を担当するコンポーネント
function TweetsContent({ me, isModalOpen, onModalClose }: TweetsContentProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);          // つぶやき一覧
  const [modalContent, setModalContent] = useState("");       // モーダル内の投稿テキスト
  const [flash, setFlash] = useState<Flash | null>(null);     // フラッシュメッセージ
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // フラッシュ自動消去タイマー
  const [editingId, setEditingId] = useState<string | null>(null); // 編集中のつぶやきID（null=編集していない）
  const [editContent, setEditContent] = useState("");         // 編集中の本文テキスト

  // マウント時につぶやき一覧を取得する（me は親で保証済みなので null チェック不要）
  useEffect(() => {
    (async () => setTweets(await getTweets()))();
  }, []);

  // モーダルが閉じられるときに入力テキストをリセットする
  useEffect(() => {
    if (!isModalOpen) setModalContent("");
  }, [isModalOpen]);

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

  // モーダルの投稿ボタン押下: バリデーション → IndexedDB に保存 → 一覧を再取得 → モーダルを閉じる
  const handleModalSubmit = async () => {
    if (!modalContent.trim()) {
      showFlash("error", "投稿内容を入力してください");
      return;
    }

    const tweet: Tweet = {
      id: uuidv4(),
      userId: me.id,
      userName: me.name,
      content: modalContent.trim(),
      createdAt: new Date().toISOString(),
    };

    await createTweet(tweet);
    setTweets(await getTweets());
    showFlash("success", "つぶやきを作成しました。");
    onModalClose(); // 投稿完了後にモーダルを閉じる
  };

  return (
    <>
      {/* フラッシュメッセージ: 成功=緑 / エラー=赤 */}
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

        {/* つぶやき一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
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
                    {/* 自分の投稿にのみ編集・削除ボタンを表示 */}
                    {tweet.userId === me.id && editingId !== tweet.id && (
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

                  {/* 本文: 編集中はテキストエリアを表示、通常時はテキスト表示 */}
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

                  {/* アクションボタン: コメント数・いいね数（将来の拡張用） */}
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
      </div>

      {/* 投稿モーダル: isModalOpen が true のときだけ表示する */}
      {isModalOpen && (
        <>
          {/* 半透明の背景オーバーレイ: クリックでモーダルを閉じる */}
          <div className="tweets-page__modal-backdrop" onClick={onModalClose} />

          {/* モーダル本体 */}
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* モーダルヘッダー */}
                <div className="modal-header">
                  <h5 className="modal-title">投稿を作成</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="閉じる"
                    onClick={onModalClose}
                  />
                </div>

                {/* モーダルボディ: 投稿テキスト入力エリア */}
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="つぶやく内容を入力してください..."
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    onKeyDown={(e) => {
                      // Cmd+Enter（Mac）/ Ctrl+Enter（Windows）でも投稿できる
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleModalSubmit();
                    }}
                    autoFocus
                  />
                </div>

                {/* モーダルフッター: キャンセル・投稿ボタン */}
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={onModalClose}>
                    キャンセル
                  </button>
                  <button className="btn btn-success" onClick={handleModalSubmit}>
                    投稿する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// UserLayout に render-prop でコンテンツを渡すラッパーコンポーネント
// モーダルの開閉状態をここで管理し、ヘッダーボタンと TweetsContent の両方に渡す
export default function TweetIndex() {
  // モーダルの表示/非表示を管理するフラグ
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <UserLayout
      menu={dashboardMenu}
      headerTitle="つぶやき一覧"
      // ヘッダーに「つぶやき投稿」ボタンを表示し、クリックでモーダルを開く
      headerAction={
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsModalOpen(true)}
        >
          つぶやき投稿
        </button>
      }
    >
      {(me) => (
        <TweetsContent
          me={me}
          isModalOpen={isModalOpen}
          onModalClose={() => setIsModalOpen(false)}
        />
      )}
    </UserLayout>
  );
}
