// src/pages/admins/VideoDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminPost, type AdminPost } from "../../lib/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import { getYouTubeVideoId } from "../../lib/youtube";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

export default function VideoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin, loading, error, handleLogout } = useRequireAdmin();
  const [video, setVideo] = useState<AdminPost | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!admin || !id) return;
    let cancelled = false;
    getAdminPost(id).then((post) => {
      if (!cancelled) { setVideo(post); setVideoReady(true); }
    }).catch(() => {
      if (!cancelled) { setVideo(null); setVideoReady(true); }
    });
    return () => { cancelled = true; };
  }, [admin, id]);

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
        <p className="text-danger mb-0">{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>再試行</button>
      </div>
    );
  }

  if (loading || !videoReady) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-muted">動画が見つかりません。</p>
      </AdminLayout>
    );
  }

  const videoId = getYouTubeVideoId(video.youtubeUrl);

  const fields = [
    { label: "タイトル", value: video.title },
    { label: "説明", value: video.body },
    { label: "URL", value: video.youtubeUrl },
    { label: "投稿日時", value: new Date(video.createdAt).toLocaleDateString("ja-JP") },
  ];

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">動画詳細</h5>
              </div>

              {videoId && (
                <div className="mb-4 d-flex justify-content-center">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube動画"
                    width="280"
                    height="180"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "4px" }}
                  />
                </div>
              )}

              <div className="mb-4">
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className="d-flex align-items-start py-3"
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <span className="text-muted" style={{ fontSize: "14px", minWidth: "100px" }}>
                      {field.label}
                    </span>
                    <span style={{ fontSize: "14px", color: "#333", wordBreak: "break-all" }}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/admin/videos")}
                >
                  一覧に戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
