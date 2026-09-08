// src/components/admin/PostThumbnailCard.tsx【新規作成】
// 受講生別 動画投稿一覧（AdminUserPostsPage）のサムネイル形式で、動画1件分を表すカード。
// サムネイルを表示できるかどうかの判定はこのカード自身が持つため、
// 一覧ページ側は「どのカードのサムネイルが失敗したか」を管理しなくてよい。

import { useState, type SyntheticEvent } from "react"
import type { AdminUserPost } from "../../lib/adminApi"
import { formatDate } from "../../lib/formatDate"
import { getYouTubeVideoId } from "../../lib/youtube"

// YouTubeが「サムネイルを出せないとき」に返すプレースホルダ画像の幅（px）。
// 削除済み動画のサムネイルURLは HTTP 404 を返すが、本文として 120x90 のグレー画像を一緒に返してくる。
// ブラウザはこれを正常な画像として読み込むため、error ではなく load イベントが発火する
// （https://img.youtube.com/vi/L18szoKQefI/mqdefault.jpg が 404 かつ 120x90 であることを実測）。
// つまり onError だけでは404を検出できず、引き伸ばされたグレーの箱が表示されてしまう。
// 正常な mqdefault の幅は320なので、読み込めた画像の幅がこの値以下ならサムネイル無しとして扱う
const YOUTUBE_PLACEHOLDER_THUMBNAIL_WIDTH = 120

// PostThumbnailCard が受け取る props
interface PostThumbnailCardProps {
  post: AdminUserPost  // 表示する動画投稿1件分のデータ
}

export default function PostThumbnailCard({ post }: PostThumbnailCardProps) {
  // サムネイルを表示できないと判明したかどうか。読み込みエラー、またはプレースホルダ画像だった場合に立てる
  const [isThumbnailUnavailable, setIsThumbnailUnavailable] = useState(false)
  // サムネイルが本物の画像として読み込めたかどうか。再生アイコンを出してよいかの判断に使う
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false)

  // 動画ID。getYouTubeVideoId は string を受け取るため、URL未設定のときは呼ぶ前に分岐する
  const videoId = post.youtubeUrl ? getYouTubeVideoId(post.youtubeUrl) : null

  // リンク先・画像URLは、DBに入っている youtube_url を生で使わず、抽出できた動画IDから組み立てる。
  // Rails 側の Post モデルは youtube_url に presence 検証しか掛けておらず形式は保証されないため、
  // javascript: スキームやパス脱出（../../evil）を含む文字列がそのまま href / img src に流れるのを防ぐ
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : null
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`
    : null

  // サムネイルを出せる条件。URL未設定・ID抽出失敗・読み込み失敗のいずれでも No Image に倒す
  const canShowThumbnail = thumbnailUrl !== null && !isThumbnailUnavailable

  // この投稿はサムネイルを表示できない、と記録する
  const markThumbnailUnavailable = () => setIsThumbnailUnavailable(true)

  // 画像の読み込み完了時の判定。
  // 読み込めた画像の実寸を見て、YouTubeのプレースホルダ（=サムネイル無し）かどうかを見分ける
  const handleThumbnailLoad = (loadEvent: SyntheticEvent<HTMLImageElement>) => {
    if (loadEvent.currentTarget.naturalWidth <= YOUTUBE_PLACEHOLDER_THUMBNAIL_WIDTH) {
      markThumbnailUnavailable()
      return
    }
    setIsThumbnailLoaded(true)
  }

  return (
    <div className="card admin-user-posts__card">
      {/* メディア領域: サムネイル画像 or No Image */}
      <div className="admin-user-posts__media">
        {canShowThumbnail ? (
          <>
            {/* サムネイル画像。装飾目的なので alt は空にする。
                失敗判定は次の2系統が必要:
                - onError: ネットワーク断など、画像そのものが読み込めなかった場合
                - onLoad + naturalWidth: YouTubeが404と一緒にプレースホルダ画像を返す場合。
                  このケースは「読み込み成功」扱いになり onError が発火しないため、幅で見分ける */}
            <img
              className="admin-user-posts__thumbnail"
              src={thumbnailUrl}
              alt=""
              loading="lazy"
              onError={markThumbnailUnavailable}
              onLoad={handleThumbnailLoad}
            />
            {/* 再生アイコン（動画であることを示す装飾）。
                本物のサムネイルだと確定してから出す。判定前に出すと、
                404の投稿が一瞬「再生できる動画」に見えてから No Image に切り替わってしまう */}
            {isThumbnailLoaded && (
              <div className="admin-user-posts__play-badge">
                <span className="admin-user-posts__play-icon" />
              </div>
            )}
          </>
        ) : (
          // No Image。文言・配色は main ブランチの AdminVideosPage.tsx と揃えている
          // （そのファイルは main にのみ存在し、本ブランチには未取込）。
          // 再生できる動画ではないので再生アイコンは載せない
          <div className="admin-user-posts__no-image text-muted">No Image</div>
        )}
      </div>

      {/* カード本文: タイトル・説明・下段のメタ情報 */}
      <div className="card-body p-3 admin-user-posts__body">
        {/* 動画タイトル。リンク先を組み立てられたときは stretched-link でカード全面をリンク化する。
            div + onClick ではなく a を使い、キーボード操作・中クリックでの別タブ表示を活かす */}
        <h6 className="card-title mb-1 admin-user-posts__title">
          {watchUrl ? (
            <a
              className="stretched-link text-decoration-none text-reset"
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.title}
            </a>
          ) : (
            // URL未設定・動画IDを抽出できない投稿は、開ける先が無いのでリンクにしない
            post.title
          )}
        </h6>

        {/* 説明文。指定行数で省略表示する */}
        <p className="card-text text-muted mb-2 admin-user-posts__description">{post.body}</p>

        {/* 下段: 左にURLの登録有無、右に投稿日時。mt-auto でカード下端に寄せ、
            タイトルの行数が違うカード同士でも高さが揃うようにする。
            日付は表形式と同じ formatDate を使い、同一ページ内で表記が食い違わないようにする */}
        <div className="admin-user-posts__meta mt-auto">
          {post.youtubeUrl ? (
            <span className="text-danger">YouTube</span>
          ) : (
            <span className="text-muted">URL未設定</span>
          )}
          <span className="text-muted">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
