import { useState, type SyntheticEvent } from "react"
import { Link } from "react-router-dom"
import type { AdminUserPost } from "../../lib/adminApi"
import { formatVideoDate } from "../../lib/formatDate"
import { getYouTubeVideoId } from "../../lib/youtube"

// YouTubeの代替画像は幅120pxで読み込める場合があるため、onErrorに加えて実寸でも判定する。
const YOUTUBE_PLACEHOLDER_THUMBNAIL_WIDTH = 120

interface PostThumbnailCardProps {
  post: AdminUserPost
}

export default function PostThumbnailCard({ post }: PostThumbnailCardProps) {
  const [isThumbnailUnavailable, setIsThumbnailUnavailable] = useState(false)
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false)

  const videoId = post.youtubeUrl ? getYouTubeVideoId(post.youtubeUrl) : null

  // 任意の登録URLを画像の取得先にせず、抽出した動画IDからYouTubeのURLを組み立てる。
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`
    : null

  const canShowThumbnail = thumbnailUrl !== null && !isThumbnailUnavailable

  const markThumbnailUnavailable = () => setIsThumbnailUnavailable(true)

  const handleThumbnailLoad = (loadEvent: SyntheticEvent<HTMLImageElement>) => {
    if (loadEvent.currentTarget.naturalWidth <= YOUTUBE_PLACEHOLDER_THUMBNAIL_WIDTH) {
      markThumbnailUnavailable()
      return
    }
    setIsThumbnailLoaded(true)
  }

  return (
    <div className="card admin-user-posts__card">
      <div className="admin-user-posts__media">
        {canShowThumbnail ? (
          <>
            <img
              className="admin-user-posts__thumbnail"
              src={thumbnailUrl}
              alt=""
              loading="lazy"
              onError={markThumbnailUnavailable}
              onLoad={handleThumbnailLoad}
            />
            {/* 代替画像に再生アイコンが一瞬表示されないよう、読み込み判定後だけ描画する。 */}
            {isThumbnailLoaded && (
              <div className="admin-user-posts__play-badge">
                <span className="admin-user-posts__play-icon" />
              </div>
            )}
          </>
        ) : (
          <div className="admin-user-posts__no-image text-muted">No Image</div>
        )}
      </div>

      <div className="card-body p-3 admin-user-posts__body">
        {/* サムネイルの有無にかかわらず既存の動画詳細へ遷移し、リンクのキーボード操作も保つ。 */}
        <h6 className="card-title mb-1 admin-user-posts__title">
          <Link
            className="stretched-link text-decoration-none text-reset"
            to={`/admin/videos/${post.id}`}
          >
            {post.title}
          </Link>
        </h6>

        <p className="card-text text-muted mb-2 admin-user-posts__description">{post.body}</p>

        <div className="admin-user-posts__meta mt-auto">
          {post.youtubeUrl ? (
            <span className="text-danger">YouTube</span>
          ) : (
            <span className="text-muted">URL未設定</span>
          )}
          <span className="text-muted">{formatVideoDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
