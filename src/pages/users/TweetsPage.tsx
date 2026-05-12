import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "../../lib/usersStore";
import { createTweet, deleteTweet, getTweets, updateTweet } from "../../lib/tweetsStore";
import type { User } from "../../lib/users";
import type { Tweet } from "../../lib/tweets";
import UserLayout from "../../components/user/UserLayout";
import { dashboardMenu } from "../../lib/userMenus";
import "../../styles/pages/tweets.css";

type Flash = { type: "success" | "error"; message: string };

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
  const [me, setMe] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [content, setContent] = useState("");
  const [flash, setFlash] = useState<Flash | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return;
      setMe(u);
      setTweets(await getTweets());
    })();
  }, []);

  const showFlash = (type: Flash["type"], message: string) => {
    setFlash({ type, message });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlash(null), 3000);
  };

  const handleEditStart = (t: { id: string; content: string }) => {
    setEditingId(t.id);
    setEditContent(t.content);
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

      <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
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
                        <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{tweet.userName}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
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
                    <p className="mb-2" style={{ whiteSpace: "pre-wrap" }}>{tweet.content}</p>
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
