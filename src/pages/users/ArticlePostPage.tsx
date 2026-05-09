import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import UserLayout from "../../components/user/UserLayout";
import ReactMarkdown from "react-markdown";
import "../../styles/pages/articlePost.css";

export default function ArticlePostPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [editorHeight, setEditorHeight] = useState<number>(500);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setEditorHeight(textarea.offsetHeight);
    const observer = new ResizeObserver(() => {
      setEditorHeight(textarea.offsetHeight);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [me]);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(u);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = () => {
    console.log("記事投稿:", { title, subtitle, body });
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!me) return null;

  return (
    <UserLayout me={me} headerTitle="投稿した記事一覧" onLogout={handleLogout}>
      <h2 className="h5 mb-4">記事投稿</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="サブタイトル"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>

      {/* Editor / Preview split */}
      <div className="d-flex gap-3 mb-4">
        <div className="article-editor-pane">
          <div className="fw-semibold mb-1 small border-bottom pb-1">エディター</div>
          <textarea
            ref={textareaRef}
            className="form-control article-editor-textarea"
            placeholder="本文"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="article-preview-pane">
          <div className="fw-semibold mb-1 small border-bottom pb-1">プレビュー</div>
          <div
            className="border p-2 bg-white article-preview-box"
            style={{ "--preview-height": `${editorHeight}px` } as React.CSSProperties}
          >
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-primary" onClick={handleSubmit}>
          投稿
        </button>
        <button className="btn btn-outline-secondary" onClick={handleCancel}>
          キャンセル
        </button>
      </div>
    </UserLayout>
  );
}
