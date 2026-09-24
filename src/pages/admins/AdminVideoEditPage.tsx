// src/pages/admins/AdminVideoEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminPost, updateAdminPost } from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import AdminLayout from "../../components/admin/AdminLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import { getYouTubeVideoId } from "../../lib/youtube";

const TITLE_MAX = 30;
const BODY_MAX = 240;

export default function AdminVideoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin, loading, error: networkError, handleLogout } = useRequireAdmin();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!admin || !id) return;
    let cancelled = false;
    getAdminPost(id)
      .then((post) => {
        if (cancelled) return;
        setTitle(post.title);
        setBody(post.body);
        setYoutubeUrl(post.youtubeUrl);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(getApiErrorMessage(err, "動画の読み込みに失敗しました。"));
        }
        setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [admin, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !id) return;
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!body.trim()) { setError("内容を入力してください。"); return; }
    if (!youtubeUrl.trim()) { setError("YoutubeのURLを入力してください。"); return; }
    if (!getYouTubeVideoId(youtubeUrl)) { setError("有効なYouTubeのURLを入力してください。"); return; }
    setIsSubmitting(true);
    try {
      await updateAdminPost(id, { title, body, youtube_url: youtubeUrl });
      navigate("/admin/videos");
    } catch (err) {
      setError(getApiErrorMessage(err, "動画の更新に失敗しました。"));
      setIsSubmitting(false);
    }
  };

  if (networkError) {
    return <PageError message={networkError} />;
  }

  if (loading || !loaded) {
    return <PageSpinner />;
  }

  if (notFound) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-muted">動画が見つかりません。</p>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-danger">{loadError}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">動画編集</h5>
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
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? "更新中..." : "更新する"}
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
