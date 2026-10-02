// src/components/admin/VideoForm.tsx
import { getYouTubeVideoId } from "../../lib/youtube";
import "../../styles/pages/videoForm.css";

export const VIDEO_TITLE_MAX = 30;
export const VIDEO_BODY_MAX = 240;

export type VideoFormValues = { title: string; body: string; youtubeUrl: string };

// 入力に問題があればメッセージを、なければ null を返す
export function validateVideoForm({ title, body, youtubeUrl }: VideoFormValues): string | null {
  if (!title.trim()) return "タイトルを入力してください。";
  if (!body.trim()) return "内容を入力してください。";
  if (!youtubeUrl.trim()) return "YoutubeのURLを入力してください。";
  if (!getYouTubeVideoId(youtubeUrl)) return "有効なYouTubeのURLを入力してください。";
  return null;
}

type Props = {
  heading: string;
  values: VideoFormValues;
  onChange: (values: VideoFormValues) => void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  errorMessage: string;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function VideoForm({
  heading, values, onChange,
  submitLabel, submittingLabel, isSubmitting,
  errorMessage, onSubmit, onCancel,
}: Props) {
  const { title, body, youtubeUrl } = values;

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="text-center pb-3 mb-4 video-form-header">
              <h5 className="mb-0">{heading}</h5>
            </div>

            {errorMessage && <p className="text-danger">{errorMessage}</p>}

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
              <div className="mb-1">
                <label className="form-label video-form-label" htmlFor="video-title">
                  タイトル
                </label>
                <input
                  id="video-title"
                  type="text"
                  className="form-control"
                  value={title}
                  maxLength={VIDEO_TITLE_MAX}
                  onChange={(e) => onChange({ ...values, title: e.target.value })}
                  placeholder={`タイトル (必須 ${VIDEO_TITLE_MAX}文字まで)`}
                />
              </div>
              <div className="mb-3 text-end">
                <span className="text-muted video-form-count">
                  {title.length}文字
                </span>
              </div>

              <div className="mb-1">
                <label className="form-label video-form-label" htmlFor="video-body">
                  内容
                </label>
                <textarea
                  id="video-body"
                  className="form-control"
                  rows={6}
                  value={body}
                  maxLength={VIDEO_BODY_MAX}
                  onChange={(e) => onChange({ ...values, body: e.target.value })}
                  placeholder={`内容 (必須 ${VIDEO_BODY_MAX}文字まで)`}
                />
              </div>
              <div className="mb-3 text-end">
                <span className="text-muted video-form-count">
                  {body.length}文字
                </span>
              </div>

              <div className="mb-4">
                <label className="form-label video-form-label" htmlFor="video-youtube-url">
                  Youtube URL
                </label>
                <input
                  id="video-youtube-url"
                  type="url"
                  className="form-control"
                  value={youtubeUrl}
                  onChange={(e) => onChange({ ...values, youtubeUrl: e.target.value })}
                  placeholder="YoutubeのURLを添付（必須)"
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? submittingLabel : submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
