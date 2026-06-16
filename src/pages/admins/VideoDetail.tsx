// src/pages/admins/VideoDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getAdminPosts, type Admin, type AdminPost } from "../../lib/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  );
  return match ? match[1] : null;
}

export default function VideoDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [video, setVideo] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);
      // TODO: GET /api/v1/admin/posts/:id が実装されたら個別取得に切り替える
      const posts = await getAdminPosts();
      const found = posts.find((p) => p.id === id) ?? null;
      if (!cancelled) {
        setVideo(found);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate, id]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
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
