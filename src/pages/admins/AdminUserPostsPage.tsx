import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  getUser,
  getAdminUserPosts,
  type AdminUserPost,
} from "../../lib/adminApi"
import AdminLayout from "../../components/admin/AdminLayout"
import PageError from "../../components/admin/PageError"
import type { LoadStatus } from "../../lib/loadStatus"
import { useRequireAdmin } from "../../lib/useRequireAdmin"
import PageSpinner from "../../components/admin/PageSpinner"
import PostThumbnailCard from "../../components/admin/PostThumbnailCard"
import { formatVideoDate } from "../../lib/formatDate"
import { buildUserPageHeading } from "../../lib/pageHeading"
import { getYouTubeVideoId } from "../../lib/youtube"
import "../../styles/pages/adminUserPosts.css"

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

type PostsViewMode = "table" | "thumbnail"

const VIEW_MODE_STORAGE_KEY = "adminUserPostsViewMode"

function loadStoredViewMode(): PostsViewMode {
  try {
    const storedViewMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (storedViewMode === "table" || storedViewMode === "thumbnail") return storedViewMode
  } catch {
    // ストレージが使えない環境でも、既定の表示形式で一覧を開けるようにする。
  }
  return "table"
}

function saveViewMode(viewMode: PostsViewMode): void {
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  } catch {
    // 設定を保存できなくても、今回の表示切り替えは維持する。
  }
}

export default function AdminUserPostsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()

  const { admin, loading: authenticationLoading, error: authenticationError, handleLogout } = useRequireAdmin()
  const [userName, setUserName] = useState<string>("")
  const [posts, setPosts] = useState<AdminUserPost[]>([])

  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  const [viewMode, setViewMode] = useState<PostsViewMode>(loadStoredViewMode)

  useEffect(() => {
    if (!admin) return
    let cancelled = false
    setLoadStatus("loading")
    ;(async () => {
      try {
        if (!userId) {
          if (!cancelled) setLoadStatus("failed")
          return
        }

        const [userInfo, userPosts] = await Promise.all([
          getUser(userId),
          getAdminUserPosts(userId),
        ])
        if (cancelled) return
        setUserName(userInfo.name)
        setPosts(userPosts)
        setLoadStatus("loaded")
      } catch {
        if (!cancelled) setLoadStatus("failed")
      }
    })()
    return () => {
      // 別ユーザーへ切り替えた後に、前の取得結果で一覧を上書きしない。
      cancelled = true
    }
  }, [admin, userId])

  const handleChangeViewMode = (nextViewMode: PostsViewMode) => {
    setViewMode(nextViewMode)
    saveViewMode(nextViewMode)
  }

  // 認証失敗時にスピナーが残り続けないよう、エラーを読み込み中より先に判定する。
  if (authenticationError || loadStatus === "failed") {
    return <PageError message="データを取得できませんでした。" />
  }

  if (authenticationLoading || loadStatus === "loading") return <PageSpinner />

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← 戻る
        </button>
        <h4 className="mb-0">{buildUserPageHeading(userName, "動画投稿一覧")}</h4>

        {posts.length > 0 && (
          <div className="btn-group btn-group-sm ms-auto" role="group" aria-label="表示形式の切り替え">
            <button
              type="button"
              className={`btn ${viewMode === "table" ? "btn-secondary" : "btn-outline-secondary"}`}
              aria-pressed={viewMode === "table"}
              onClick={() => handleChangeViewMode("table")}
            >
              表形式
            </button>
            <button
              type="button"
              className={`btn ${viewMode === "thumbnail" ? "btn-secondary" : "btn-outline-secondary"}`}
              aria-pressed={viewMode === "thumbnail"}
              onClick={() => handleChangeViewMode("thumbnail")}
            >
              サムネイル
            </button>
          </div>
        )}
      </div>

      {/* 一覧の表示形式が切り替わったことをスクリーンリーダーへ伝える。 */}
      <div className="visually-hidden" aria-live="polite">
        {viewMode === "table"
          ? `表形式で${posts.length}件を表示中`
          : `サムネイル形式で${posts.length}件を表示中`}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted text-center py-5">動画の投稿はまだありません</p>
      ) : viewMode === "table" ? (
        <div className="card shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>タイトル</th>
                <th>説明（プレビュー）</th>
                <th>動画URL</th>
                <th>投稿日時</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                // 任意の登録URLを開かないよう、抽出した動画IDからYouTubeのURLを組み立てる。
                const videoId = post.youtubeUrl ? getYouTubeVideoId(post.youtubeUrl) : null
                const watchUrl = videoId
                  ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
                  : null

                return (
                  <tr key={post.id}>
                    <td className="fw-semibold">
                      <Link to={`/admin/videos/${post.id}`} className="text-decoration-none text-reset">
                        {post.title}
                      </Link>
                    </td>
                    <td className="text-muted">
                      {truncateText(post.body, 60)}
                    </td>
                    {/* YouTubeボタンは、アプリ内詳細とは別の外部視聴用リンクとして残す。 */}
                    <td>
                      {watchUrl ? (
                        <a
                          href={watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-danger btn-sm"
                        >
                          YouTube
                        </a>
                      ) : (
                        <span className="text-muted">―</span>
                      )}
                    </td>
                    <td className="text-nowrap text-muted">
                      {formatVideoDate(post.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="row g-4 admin-user-posts-grid">
          {posts.map((post) => (
            <div className="col-6 col-xl-4 col-xxl-3" key={post.id}>
              <PostThumbnailCard post={post} />
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
