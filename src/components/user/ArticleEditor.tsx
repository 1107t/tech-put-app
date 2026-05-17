import React, { useCallback, useLayoutEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/pages/articlePost.css";

type Props = {
  title: string;
  onTitleChange: (v: string) => void;
  subtitle: string;
  onSubtitleChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function ArticleEditor({
  title, onTitleChange,
  subtitle, onSubtitleChange,
  body, onBodyChange,
  submitLabel, onSubmit, onCancel,
}: Props) {
  const [editorHeight, setEditorHeight] = useState<number>(500);
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null);

  const textareaRef = useCallback((el: HTMLTextAreaElement | null) => setTextareaEl(el), []);

  useLayoutEffect(() => {
    if (!textareaEl) return;
    const observer = new ResizeObserver(() => setEditorHeight(textareaEl.offsetHeight));
    observer.observe(textareaEl);
    return () => observer.disconnect();
  }, [textareaEl]);

  return (
    <>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="タイトル"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="サブタイトル"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
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
            onChange={(e) => onBodyChange(e.target.value)}
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
        <button className="btn btn-primary" onClick={onSubmit}>
          {submitLabel}
        </button>
        <button className="btn btn-outline-secondary" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </>
  );
}
