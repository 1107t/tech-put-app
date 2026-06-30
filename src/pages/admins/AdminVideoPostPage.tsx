// src/pages/admins/AdminVideoPostPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminPost } from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

const TITLE_MAX = 30;
const BODY_MAX = 240;

export default function AdminVideoPostPage() {
  const navigate = useNavigate();
  const { admin, loading, error: networkError, handleLogout } = useRequireAdmin();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!body.trim()) { setError("内容を入力してください。"); return; }
    if (!youtubeUrl.trim()) { setError("YoutubeのURLを入力してください。"); return; }
    try {
      await createAdminPost({ title, body, youtube_url: youtubeUrl });
      navigate("/admin/videos");
    } catch (err) {
      setError(getApiErrorMessage(err, "動画の投稿に失敗しました。"));
    }
  };

  if (networkError) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
        <p className="text-danger mb-0">{networkError}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>再試行</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">動画投稿</h5>
              </div>

              {error && <p className="text-danger">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="mb-1">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    タイトル
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="タイトル (必須 30文字まで)"
                  />
                </div>
                <div className="mb-3 text-end">
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    {title.length}文字
                  </span>
                </div>

                <div className="mb-1">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    内容
                  </label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={body}
                    maxLength={BODY_MAX}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="内容 (必須 240文字まで)"
                  />
                </div>
                <div className="mb-3 text-end">
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    {body.length}文字
                  </span>
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    Youtube URL
                  </label>
                  <input
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
                  >
                    キャンセル
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    投稿する
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
