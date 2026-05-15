import React, { useCallback, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardMenu } from "../../../lib/userMenus";
import UserLayout from "../../../components/user/UserLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../../styles/pages/articlePost.css";

export default function ArticlePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [editorHeight, setEditorHeight] = useState<number>(500);
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null);

  const textareaRef = useCallback((el: HTMLTextAreaElement | null) => setTextareaEl(el), []);

  useLayoutEffect(() => {
    if (!textareaEl) return;
    const observer = new ResizeObserver(() => setEditorHeight(textareaEl.offsetHeight));
    observer.observe(textareaEl);
    return () => observer.disconnect();
  }, [textareaEl]);

  const handleSubmit = () => {
    console.log("記事投稿:", { title, subtitle, body });
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事投稿">
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </div>
      </div>

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
