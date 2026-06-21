// src/pages/users/video/Index.tsx
import { useEffect, useState } from "react";
import type { User } from "../../../lib/userTypes";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import { getUserPosts, deleteUserPost, type UserPost } from "../../../lib/userApi";
import { getYouTubeVideoId } from "../../../lib/youtube";

function VideoList({ me }: { me: User }) {
  const [videos, setVideos] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const posts = await getUserPosts();
        setVideos(posts);
      } catch {
        setError("動画の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    })();
  }, [me.id]);

  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("この動画を削除しますか？")) return;
    try {
      await deleteUserPost(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setOpenMenuId(null);
    } catch {
      setError("削除に失敗しました。");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <p className="text-danger mb-3">{error}</p>}

      {videos.length === 0 ? (
        <div className="text-center text-muted py-5">投稿した動画がありません</div>
      ) : (
        <div className="row g-4">
          {videos.map((video) => {
            const videoId = getYouTubeVideoId(video.youtubeUrl);
            return (
              <div key={video.id} className="col-auto">
                <div className="card shadow-sm h-100" style={{ width: "280px" }}>
                  <div style={{ width: "280px", height: "180px", overflow: "hidden" }}>
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
                  </div>
                  <div className="card-body p-3">
                    <h6 className="card-title mb-1" style={{ fontSize: "14px" }}>
                      {video.title}
                    </h6>
                    <p
                      className="card-text text-muted mb-2"
                      style={{
                        fontSize: "12px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {video.body}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(video.createdAt).toLocaleDateString("ja-JP")}
                      </small>
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function UserVideoIndexPage() {
  return (
    <UserLayout menu={dashboardMenu} headerTitle="動画投稿一覧">
      {(me) => <VideoList me={me} />}
    </UserLayout>
  );
}
