import MarkdownView from "./MarkdownView";
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
  disabled?: boolean;
};

export default function ArticleEditor({
  title, onTitleChange,
  subtitle, onSubtitleChange,
  body, onBodyChange,
  submitLabel, onSubmit, onCancel,
  disabled = false,
}: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="row mt-4">

        <div className="col-12 mb-2">
          <input
            type="text"
            placeholder="タイトル"
            className="form-control title-form"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <div className="col-12 mb-4">
          <input
            type="text"
            placeholder="サブタイトル"
            className="form-control subtitle-form"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6 mb-3">
          <div className="card card-outline card-info">
            <div className="card-header">
              <h3 className="card-title">エディター</h3>
            </div>
            <div className="card-body p-0">
              <textarea
                placeholder="本文"
                className="form-control markdown-editor"
                rows={30}
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 mb-3 d-none d-md-block">
          <div className="card card-outline card-info">
            <div className="card-header">
              <h3 className="card-title">プレビュー</h3>
            </div>
            <div className="card-body p-0">
              <div className="article-preview-box">
                <MarkdownView body={body} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 text-center my-3">
          <button type="submit" className="btn btn-primary mx-2" disabled={disabled}>
            {disabled ? "送信中..." : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary mx-2" onClick={onCancel} disabled={disabled}>
            キャンセル
          </button>
        </div>

      </div>
    </form>
  );
}
