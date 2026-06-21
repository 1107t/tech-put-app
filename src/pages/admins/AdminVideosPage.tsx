// src/pages/admins/AdminVideosPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminPosts, deleteAdminPost, type AdminPost } from "../../lib/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import { getYouTubeVideoId } from "../../lib/youtube";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

type FilterState = {
  posterName: string;
  title: string;
  body: string;
  createdAtFrom: string;
  createdAtTo: string;
};

const emptyFilter: FilterState = { posterName: "", title: "", body: "", createdAtFrom: "", createdAtTo: "" };

export default function AdminVideosPage() {
  const navigate = useNavigate();
  const { admin, loading, handleLogout } = useRequireAdmin();
  const [videos, setVideos] = useState<AdminPost[]>([]);
  const [videosReady, setVideosReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>(emptyFilter);
  const [applied, setApplied] = useState<FilterState>(emptyFilter);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const PER_PAGE = 30;

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    getAdminPosts().then((posts) => {
      if (!cancelled) { setVideos(posts); setVideosReady(true); }
    });
    return () => { cancelled = true; };
  }, [admin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("この動画を削除しますか？")) return;
    try {
      await deleteAdminPost(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setOpenMenuId(null);
    } catch {
      setDeleteError("削除に失敗しました。時間をおいて再度お試しください。");
      setOpenMenuId(null);
    }
  };

  const handleApply = () => {
    setApplied(filter);
    setPage(1);
    setModalOpen(false);
  };

  const handleReset = () => {
    setFilter(emptyFilter);
    setApplied(emptyFilter);
    setPage(1);
    setModalOpen(false);
  };

  const filteredVideos = videos
    .filter((v) => {
    if (applied.posterName && !(v.posterName ?? "").includes(applied.posterName)) return false;
    if (applied.title && !v.title.includes(applied.title)) return false;
    if (applied.body && !v.body.includes(applied.body)) return false;
    const postedAt = new Date(v.createdAt);
    if (applied.createdAtFrom && postedAt < new Date(applied.createdAtFrom)) return false;
    if (applied.createdAtTo && postedAt > new Date(applied.createdAtTo + "T23:59:59")) return false;
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortAsc ? diff : -diff;
    });

  const totalPages = Math.ceil(filteredVideos.length / PER_PAGE);
  const pagedVideos = filteredVideos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading || !videosReady) {
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
      {deleteError && (
        <div className="alert alert-danger alert-dismissible py-2 mb-3" role="alert">
          {deleteError}
          <button type="button" className="btn-close" onClick={() => setDeleteError(null)} />
        </div>
      )}
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">動画投稿一覧</h4>
        <button className="btn btn-success btn-sm" onClick={() => setSortAsc((v) => !v)}>
          並べ替え
        </button>
        <button className="btn btn-success btn-sm" onClick={() => { setFilter(applied); setModalOpen(true); }}>
          絞り込み検索
        </button>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center text-muted py-5">投稿された動画がありません</div>
      ) : (
        <>
        <div className="row g-4">
          {pagedVideos.map((video) => {
            const videoId = getYouTubeVideoId(video.youtubeUrl);
            return (
              <div key={video.id} className="col-auto">
                <div className="card shadow-sm h-100" style={{ width: "280px" }}>
                  <div
                    style={{ position: "relative", width: "280px", height: "180px", overflow: "hidden", cursor: "pointer" }}
                    onClick={() => navigate(`/admin/videos/${video.id}`)}
                  >
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube動画"
                        width="280"
                        height="180"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ display: "block", pointerEvents: "none" }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center text-muted"
                        style={{ width: "280px", height: "180px", background: "#f0f0f0", fontSize: "12px" }}
                      >
                        No Image
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0 }} />
                  </div>
                  <div className="card-body p-3">
                    <h6
                      className="card-title mb-1"
                      style={{ fontSize: "14px", cursor: "pointer" }}
                      onClick={() => navigate(`/admin/videos/${video.id}`)}
                    >
                      {video.title}
                    </h6>
                    <p
                      className="card-text text-muted mb-2"
                      style={{ fontSize: "12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", cursor: "pointer" }}
                      onClick={() => navigate(`/admin/videos/${video.id}`)}
                    >
                      {video.body}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small
                        className="text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (video.userId) navigate(`/admin/users/${video.userId}`);
                          else if (video.adminId) navigate(`/admin/${video.adminId}`);
                        }}
                      >
                        {video.posterName ?? "—"}
                      </small>
                      <div className="d-flex align-items-center gap-1">
                        <small className="text-muted">{new Date(video.createdAt).toLocaleDateString("ja-JP")}</small>
                        {(video.userId !== null || video.adminId === admin?.id) && (
                        <div style={{ position: "relative" }}>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-muted"
                            style={{ lineHeight: 1, fontSize: "16px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === video.id ? null : video.id);
                            }}
                          >
                            ⋮
                          </button>
                          {openMenuId === video.id && (
                            <>
                              <div
                                style={{ position: "fixed", inset: 0, zIndex: 9 }}
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "100%",
                                  backgroundColor: "#fff",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "4px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  zIndex: 10,
                                  minWidth: "80px",
                                }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-danger w-100 text-start px-3 py-2"
                                  style={{ fontSize: "13px", textDecoration: "none" }}
                                  onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                                >
                                  削除
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="mt-4 d-flex justify-content-center">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => p - 1)}>‹</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => p + 1)}>›</button>
              </li>
            </ul>
          </nav>
        )}
        </>
      )}

      {/* 絞り込み検索モーダル */}
      {modalOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
            onClick={() => setModalOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1050,
              width: "420px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: "1px solid #dee2e6" }}>
              <h6 className="mb-0">絞り込み検索</h6>
              <button className="btn-close" onClick={() => setModalOpen(false)} />
            </div>
            <div className="p-4">
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "14px" }}>投稿者</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={filter.posterName}
                  onChange={(e) => setFilter((f) => ({ ...f, posterName: e.target.value }))}
                  placeholder="投稿者名で絞り込み"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "14px" }}>タイトル</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={filter.title}
                  onChange={(e) => setFilter((f) => ({ ...f, title: e.target.value }))}
                  placeholder="タイトルで絞り込み"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: "14px" }}>内容</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={filter.body}
                  onChange={(e) => setFilter((f) => ({ ...f, body: e.target.value }))}
                  placeholder="内容で絞り込み"
                />
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ fontSize: "14px" }}>投稿日時</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filter.createdAtFrom}
                    onChange={(e) => setFilter((f) => ({ ...f, createdAtFrom: e.target.value }))}
                  />
                  <span className="text-muted" style={{ fontSize: "14px", whiteSpace: "nowrap" }}>〜</span>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filter.createdAtTo}
                    onChange={(e) => setFilter((f) => ({ ...f, createdAtTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
                  戻る
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleApply}>
                  検索する
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
