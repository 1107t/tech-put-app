// src/pages/users/tweet/Index.tsx【修正】
// つぶやき一覧ページ。一覧はスクロール可能で、投稿フォームは画面下部に固定表示する。
// 画像添付（ファイル選択・ドラッグ&ドロップ）に対応。
// IndexedDB から Rails API へ移行したため、画像は Active Storage の URL で表示する。
// UserLayout の render-prop から me を受け取るため、useRequireAuth の二重呼び出しを解消している。
import { useEffect, useRef, useState } from "react";
import { createTweet, deleteTweet, getTweets, updateTweet, likeTweet, unlikeTweet, addComment } from "../../../lib/tweetsStore";
import type { User } from "../../../lib/userTypes";
import type { Tweet } from "../../../lib/tweets";
import UserLayout from "../../../components/user/UserLayout";
import { dashboardMenu } from "../../../components/user/UserLayout";
import "../../../styles/pages/tweets.css";

// フラッシュメッセージの型（成功=緑 / エラー=赤）
type Flash = {
  type: "success" | "error"; // 表示色の種別
  message: string;           // 表示するメッセージ内容
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;      // 1ファイルの上限: 5MB
const MAX_FILES_PER_TWEET = 4;              // 1ツイートに添付できる画像の上限

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

// UserLayout の render-prop から me を受け取り、つぶやき一覧・投稿・編集・削除・いいね・コメントを担当するコンポーネント
function TweetsContent({ me }: { me: User }) {
  const [tweets, setTweets] = useState<Tweet[]>([]);                  // つぶやき一覧（APIから取得）
  const [content, setContent] = useState("");                         // 投稿フォームの入力テキスト
  const [selectedImages, setSelectedImages] = useState<File[]>([]);   // 投稿に添付する画像（File形式）
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);       // 投稿前プレビュー用のObject URL
  const [isDragging, setIsDragging] = useState(false);               // ドラッグ中かどうかのフラグ
  const [flash, setFlash] = useState<Flash | null>(null);            // フラッシュメッセージ
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // フラッシュ自動消去タイマー
  const [editingId, setEditingId] = useState<string | null>(null);   // 編集中のつぶやきID
  const [editContent, setEditContent] = useState("");                 // 編集中の本文テキスト
  const fileInputRef = useRef<HTMLInputElement | null>(null);         // ファイル選択inputへの参照
  // コメント入力欄を開いているつぶやきのID（nullは全て閉じている状態）
  const [openCommentTweetId, setOpenCommentTweetId] = useState<string | null>(null);
  // 各つぶやきのコメント入力テキスト（tweetId → 入力テキスト）
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false); // 非同期処理中のフラグ

  // マウント時につぶやき一覧をAPIから取得する
  useEffect(() => {
    (async () => {
      try {
        setTweets(await getTweets())
      } catch {
        // 取得失敗時はエラーフラッシュを表示する
        setFlash({ type: "error", message: "つぶやきの取得に失敗しました" })
      }
    })()
  }, []);

  // 選択中の画像が変わるたびにプレビュー用Object URLを生成する
  // クリーンアップで前回のURLを解放してメモリリークを防ぐ
  useEffect(() => {
    const urls = selectedImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  // アンマウント時にフラッシュタイマーをクリアする（アンマウント後のstate更新によるReact警告を防ぐ）
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // フラッシュメッセージを表示し、3秒後に自動消去する
  const showFlash = (type: Flash["type"], message: string) => {
    setFlash({ type, message });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlash(null), 3000);
  };

  // ファイル選択ダイアログから画像を選択したときの処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = Array.from(event.target.files ?? []).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_FILE_SIZE) { showFlash('error', `${file.name} は5MBを超えています`); return false; }
      return true;
    });
    setSelectedImages((previous) => [...previous, ...validFiles].slice(0, MAX_FILES_PER_TWEET));
    event.target.value = '';
  };

  // ドラッグ中にドロップ領域に入ったときの処理
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // デフォルトのブラウザ動作（ファイルを新タブで開く）を無効化
    setIsDragging(true);
  };

  // ドロップ領域からドラッグが離れたときの処理
  const handleDragLeave = () => setIsDragging(false);

  // ファイルをドロップしたときの処理
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const validFiles = Array.from(event.dataTransfer.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_FILE_SIZE) { showFlash('error', `${file.name} は5MBを超えています`); return false; }
      return true;
    });
    setSelectedImages((previous) => [...previous, ...validFiles].slice(0, MAX_FILES_PER_TWEET));
  };

  // プレビューから特定の画像を削除する
  const handleRemoveImage = (index: number) => {
    setSelectedImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
  };

  // 編集ボタン押下: 対象ツイートの内容をセットしてインライン編集モードへ
  const handleEditStart = (tweet: Tweet) => {
    setEditingId(tweet.id);
    setEditContent(tweet.content);
  };

  // 編集確定: 空文字はエラー、成功時はAPIに送信して一覧を再取得する
  const handleEditSave = async (id: string) => {
    if (!editContent.trim()) {
      showFlash("error", "内容を入力してください");
      return;
    }
    try {
      setIsLoading(true);
      await updateTweet(id, editContent.trim());
      setEditingId(null);
      setTweets(await getTweets());
      showFlash("success", "つぶやきを更新しました。");
    } catch {
      showFlash("error", "保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 削除ボタン押下: APIから削除して一覧を再取得する
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteTweet(id);
      setTweets(await getTweets());
      showFlash("success", "つぶやきを削除しました。");
    } catch {
      showFlash("error", "削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 投稿ボタン押下: バリデーション → APIに送信 → 一覧を再取得 → フォームをリセットする
  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      showFlash("error", "テキストまたは画像を入力してください");
      return;
    }
    try {
      setIsLoading(true);
      // API が ID・日時を採番するため、フロントでは content と images だけ渡す
      await createTweet(content.trim(), selectedImages.length > 0 ? selectedImages : undefined);
      setContent("");
      setSelectedImages([]);
      setTweets(await getTweets());
      showFlash("success", "つぶやきを作成しました。");
    } catch {
      showFlash("error", "保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // いいねをトグルする: 未いいね→いいね追加、いいね済み→いいね解除
  const handleLikeToggle = async (tweet: Tweet) => {
    try {
      if (tweet.likedByCurrentUser) {
        await unlikeTweet(tweet.id);
      } else {
        await likeTweet(tweet.id);
      }
      // APIから最新状態を取得してカウントを反映する
      setTweets(await getTweets());
    } catch {
      showFlash("error", "いいねに失敗しました");
    }
  };

  // コメントを投稿する: 空文字は無視し、投稿後に入力欄をクリアして一覧を更新する
  const handleCommentSubmit = async (tweetId: string) => {
    const commentText = commentInputs[tweetId]?.trim();
    if (!commentText) return;
    try {
      await addComment(tweetId, commentText);
      setCommentInputs((previous) => ({ ...previous, [tweetId]: "" }));
      setTweets(await getTweets());
    } catch {
      showFlash("error", "コメントの投稿に失敗しました");
    }
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

      {/* 一覧エリア: 下部固定フォームに隠れないよう padding-bottom を確保 */}
      <div className="tweets-page__content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">つぶやき一覧</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm">並べ替え</button>
            <button className="btn btn-outline-secondary btn-sm">絞り込み検索</button>
          </div>
        </div>

        {/* ツイート一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
        {tweets.length === 0 ? (
          <p className="text-muted text-center py-5">つぶやきはまだありません</p>
        ) : (
          <div className="d-grid gap-3">
            {tweets.map((tweet) => {
              const isLiked = tweet.likedByCurrentUser ?? false;
              const likeCount = tweet.likesCount ?? 0;
              const commentCount = tweet.comments?.length ?? 0;
              const isCommentOpen = openCommentTweetId === tweet.id;

              return (
                <div key={tweet.id} className="card shadow-sm tweets-page__tweet-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
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
                      {/* 自分の投稿にのみ編集・削除ボタンを表示 */}
                      {tweet.userId === me.id && editingId !== tweet.id && (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleEditStart(tweet)}
                            disabled={isLoading}
                          >
                            編集
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(tweet.id)}
                            disabled={isLoading}
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
                          onChange={(event) => setEditContent(event.target.value)}
                          onKeyDown={(event) => {
                            // Cmd+Enter（Mac）/ Ctrl+Enter（Windows）で保存できる
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                              event.preventDefault();
                              handleEditSave(tweet.id);
                            }
                          }}
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
                            disabled={isLoading}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mb-2 tweets-page__body">{tweet.content}</p>
                    )}

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
                        onClick={() => handleLikeToggle(tweet)}
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
      </div>

      {/* 投稿フォーム: 画面下部に固定表示。スクロールしても常に見える */}
      <div className="tweets-page__fixed-form">
        <div className="tweets-page__fixed-form-inner">

          {/* 画像プレビューエリア: 選択済み画像をサムネイル表示し、×ボタンで個別削除できる */}
          {previewUrls.length > 0 && (
            <div className="tweets-page__preview-grid mb-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="tweets-page__preview-item">
                  <img src={url} alt={`プレビュー ${index + 1}`} className="tweets-page__preview-image" />
                  {/* ×ボタンで該当画像を削除 */}
                  <button
                    className="tweets-page__preview-remove"
                    onClick={() => handleRemoveImage(index)}
                    aria-label="画像を削除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* テキスト入力エリア + ドラッグ&ドロップ対応 */}
          <div
            className={`tweets-page__drop-zone ${isDragging ? "tweets-page__drop-zone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className="form-control mb-2"
              rows={2}
              placeholder="つぶやく内容を入力、または画像をここにドロップ..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => {
                // Cmd+Enter（Mac）/ Ctrl+Enter（Windows）でも投稿できる
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* フォームアクション: 画像選択ボタンと投稿ボタン */}
          <div className="d-flex justify-content-between align-items-center">
            {/* 画像添付ボタン: クリックで非表示のファイル選択inputを起動する */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              🖼 画像を追加
            </button>
            {/* 非表示のファイル選択input: 画像ファイルのみ・複数選択可 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="d-none"
              onChange={handleFileSelect}
            />
            <button
              className="btn btn-success btn-sm px-4"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "送信中..." : "投稿する"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// UserLayout に render-prop でコンテンツを渡すラッパーコンポーネント
export default function TweetIndex() {
  return (
    <UserLayout menu={dashboardMenu} headerTitle="つぶやき一覧">
      {(me) => <TweetsContent me={me} />}
    </UserLayout>
  );
}
