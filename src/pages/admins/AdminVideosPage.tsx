// src/pages/admins/AdminVideosPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getAdminPosts, type Admin, type AdminPost } from "../../lib/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminVideosPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [videos, setVideos] = useState<AdminPost[]>([]);
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
      const posts = await getAdminPosts();
      if (!cancelled) {
        setVideos(posts);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

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

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">動画投稿一覧</h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>タイトル</th>
              <th>投稿者</th>
              <th>URL</th>
              <th>投稿日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  投稿された動画がありません
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{video.body}</td>
                  <td>
                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                      {video.youtubeUrl}
                    </a>
                  </td>
                  <td className="text-muted">{new Date(video.createdAt).toLocaleDateString("ja-JP")}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-link text-secondary p-0"
                      onClick={() => navigate(`/admin/videos/${video.id}`)}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
