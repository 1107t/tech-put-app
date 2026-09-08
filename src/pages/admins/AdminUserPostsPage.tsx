// src/pages/admins/AdminUserPostsPage.tsx【修正】
// 管理者側のユーザー別動画投稿一覧ページ。
// 指定ユーザーが投稿した動画（YouTube）を、表形式とサムネイル形式で切り替えて一覧表示する。

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getCurrentAdmin,
  adminLogout,
  getUser,
  getAdminUserPosts,
  type Admin,
  type AdminUserPost,
} from "../../lib/adminApi"
import AdminLayout from "../../components/admin/AdminLayout"
// ページ全体の読み込みに失敗したときの、本文に代わる恒久的なエラー表示。
// このページは閲覧専用で操作を持たないため、通知はこれだけでよく、フラッシュメッセージは使わない
import PageError from "../../components/admin/PageError"
import type { LoadStatus } from "../../lib/loadStatus"
// サムネイル形式のカード1枚分の描画
import PostThumbnailCard from "../../components/admin/PostThumbnailCard"
// 日付整形はページ内の重複実装を廃止し、共通ユーティリティを使う（DRY原則）
import { formatDate } from "../../lib/formatDate"
// 見出し文言の組み立ても、兄弟の一覧ページと共通のユーティリティに寄せる
import { buildUserPageHeading } from "../../lib/pageHeading"
// 表形式のリンク先を、DBの値ではなく抽出した動画IDから組み立てるために使う
import { getYouTubeVideoId } from "../../lib/youtube"
import "../../styles/pages/adminUserPosts.css"

// 本文テキストを指定文字数で省略して表示するユーティリティ
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// 一覧の表示形式。table=表形式 / thumbnail=YouTubeサムネイルのカード一覧
type PostsViewMode = "table" | "thumbnail"

// 表示形式を localStorage に保存するときのキー。ページを開き直しても前回の見方を維持する
const VIEW_MODE_STORAGE_KEY = "adminUserPostsViewMode"

// localStorage から表示形式を復元する。
// 保存値が想定外の文字列（手で書き換えられた・仕様変更で古い値が残った）のときは既定の "table" に倒す。
// またプライベートモード等では localStorage へのアクセス自体が例外を投げるため、try/catch で囲んで画面を守る
function loadStoredViewMode(): PostsViewMode {
  try {
    const storedViewMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (storedViewMode === "table" || storedViewMode === "thumbnail") return storedViewMode
  } catch {
    // 読み取りに失敗しても一覧は表示できるため、既定値で続行する
  }
  return "table"
}

// 表示形式を localStorage へ保存する。保存できなくても今回の表示は成立するので失敗は無視する
function saveViewMode(viewMode: PostsViewMode): void {
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  } catch {
    // 保存に失敗しても画面の動作には影響しないため、何もしない
  }
}

export default function AdminUserPostsPage() {
  const navigate = useNavigate()
  // URLパラメータからユーザーIDを取得する
  const { userId } = useParams<{ userId: string }>()

  const [admin, setAdmin] = useState<Admin | null>(null)
  // 画面見出しに表示するユーザー名
  const [userName, setUserName] = useState<string>("")
  // 対象ユーザーの動画投稿一覧
  const [posts, setPosts] = useState<AdminUserPost[]>([])

  // ページ全体の読み込み状態。
  // 「読み込み中」と「失敗」を別々の boolean で持つと、失敗を表示しないまま
  // 空状態のメッセージ（＝0件と断定する文言）を出してしまう事故が起きる。
  // 1つの状態にまとめ、描画側で failed の分岐を必ず書くようにしている
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  // 一覧の表示形式（表 or サムネイル）。既定は "table" とし、従来の見え方を変えない。
  // useState の初期値に関数を渡すと初回レンダー時だけ実行されるため、毎回 localStorage を読みに行かずに済む
  const [viewMode, setViewMode] = useState<PostsViewMode>(loadStoredViewMode)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // 管理者ログイン確認。未ログインならログインページへリダイレクトする。
        // getCurrentAdmin は 401 のときだけ null を返し、500・タイムアウト・通信断では throw する。
        // try の外に置くと throw が finally に届かず、スピナーが回り続けるため必ず try の中で呼ぶ
        const currentAdmin = await getCurrentAdmin()
        if (cancelled) return
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true })
          return
        }
        setAdmin(currentAdmin)

        // URLにユーザーIDが無ければ取得しようがないので、失敗として扱う（読み込み中のまま止めない）
        if (!userId) {
          if (!cancelled) setLoadStatus("failed")
          return
        }

        // ユーザー情報と動画投稿一覧を並列取得する
        const [userInfo, userPosts] = await Promise.all([
          getUser(userId),
          getAdminUserPosts(userId),
        ])
        if (cancelled) return
        setUserName(userInfo.name)
        setPosts(userPosts)
        setLoadStatus("loaded")
      } catch {
        // ログイン確認・ユーザー情報・動画投稿のいずれの失敗もここに来る。
        // 失敗の表示は PageError が担うので、ここでは状態を立てるだけでよい
        if (!cancelled) setLoadStatus("failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, userId])

  const handleLogout = async () => {
    await adminLogout()
    navigate("/admin/login", { replace: true })
  }

  // 表示形式を切り替える。次回この画面を開いたときに同じ見方で始められるよう localStorage にも保存する
  const handleChangeViewMode = (nextViewMode: PostsViewMode) => {
    setViewMode(nextViewMode)
    saveViewMode(nextViewMode)
  }

  // データ取得中はスピナーを表示する
  if (loadStatus === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    )
  }

  // 取得に失敗したときは、本文の代わりにエラー画面を出す。
  // フラッシュは3秒で消えるため、失敗した状態を伝え続ける役割はこちらが担う
  if (loadStatus === "failed") {
    return <PageError message="データを取得できませんでした。" />
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* ページヘッダー: 戻るボタン・ユーザー名・表示形式の切替 */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← 戻る
        </button>
        {/* 仕様書準拠でユーザー名に「さん」を付けて見出しを表示する。
            名前が取得できなかった場合の文言は buildUserPageHeading が判断する */}
        <h4 className="mb-0">{buildUserPageHeading(userName, "動画投稿一覧")}</h4>

        {/* 表形式 ⇄ サムネイルの切替。動画が0件のときは切り替える対象が無いので描画しない */}
        {posts.length > 0 && (
          <div className="btn-group btn-group-sm ms-auto" role="group" aria-label="表示形式の切り替え">
            {/* 選択中は塗り（btn-secondary）、非選択は枠線のみ。
                btn-group は選択状態をDOMに持たないため aria-pressed で支援技術にも伝える */}
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

      {/* 表示形式が切り替わったことを支援技術へ伝えるライブリージョン。
          aria-pressed は「いま何が選ばれているか」を静的に伝えるだけで、
          「たったいま一覧が丸ごと差し替わった」ことは伝わらないため、視覚的非表示の領域で読み上げる */}
      <div className="visually-hidden" aria-live="polite">
        {viewMode === "table"
          ? `表形式で${posts.length}件を表示中`
          : `サムネイル形式で${posts.length}件を表示中`}
      </div>

      {/* 動画投稿一覧: 投稿がなければ空メッセージ、あれば選択中の表示形式で表示。
          取得失敗はこの手前で PageError に分岐済みなので、ここは成功時だけを考えればよい */}
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
                // リンク先は youtube_url を生で使わず、抽出できた動画IDから組み立てる。
                // Rails 側は presence 検証しか掛けておらず形式が保証されないため、
                // javascript: スキーム等がそのまま href に流れるのを防ぐ
                const videoId = post.youtubeUrl ? getYouTubeVideoId(post.youtubeUrl) : null
                const watchUrl = videoId
                  ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
                  : null

                return (
                  <tr key={post.id}>
                    {/* 動画タイトル */}
                    <td className="fw-semibold">{post.title}</td>
                    {/* 本文の先頭60文字をプレビュー表示する */}
                    <td className="text-muted">
                      {truncateText(post.body, 60)}
                    </td>
                    {/* 動画IDを取り出せた場合だけリンクを表示する */}
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
                        // 仕様書準拠でURL未設定時は「―」を表示する。
                        // 動画IDを取り出せなかった不正なURLも、開ける先が無いので同じ扱いにする
                        <span className="text-muted">―</span>
                      )}
                    </td>
                    {/* 投稿日時 */}
                    <td className="text-nowrap text-muted">
                      {formatDate(post.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // サムネイル形式。列は流動幅にして、画面幅に応じて1行あたりの枚数が変わるようにする
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
