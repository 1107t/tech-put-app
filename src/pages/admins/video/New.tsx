// src/pages/admins/video/New.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminPost } from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageSpinner from "../../../components/admin/PageSpinner";
import PageError from "../../../components/admin/PageError";
import { useRequireAdmin } from "../../../lib/useRequireAdmin";
import { getYouTubeVideoId } from "../../../lib/youtube";
import "../../../styles/pages/videoForm.css";

const TITLE_MAX = 30;
const BODY_MAX = 240;

export default function AdminVideoPostPage() {
  const navigate = useNavigate();
  const { admin, loading, error: networkError, handleLogout } = useRequireAdmin();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!body.trim()) { setError("内容を入力してください。"); return; }
    if (!youtubeUrl.trim()) { setError("YoutubeのURLを入力してください。"); return; }
    if (!getYouTubeVideoId(youtubeUrl)) { setError("有効なYouTubeのURLを入力してください。"); return; }
    setIsSubmitting(true);
    try {
      await createAdminPost({ title, body, youtubeUrl });
      navigate("/admin/videos");
    } catch (err) {
      setError(getApiErrorMessage(err, "動画の投稿に失敗しました。"));
      setIsSubmitting(false);
    }
  };

  if (networkError) {
    return <PageError message={networkError} />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4 video-form-header">
                <h5 className="mb-0">動画投稿</h5>
              </div>

              {error && <p className="text-danger">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="mb-1">
                  <label className="form-label video-form-label" htmlFor="video-title">
                    タイトル
                  </label>
                  <input
                    id="video-title"
                    type="text"
                    className="form-control"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`タイトル (必須 ${TITLE_MAX}文字まで)`}
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
                    maxLength={BODY_MAX}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={`内容 (必須 ${BODY_MAX}文字まで)`}
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
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="YoutubeのURLを添付（必須)"
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/admin/videos")}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? "投稿中..." : "投稿する"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
