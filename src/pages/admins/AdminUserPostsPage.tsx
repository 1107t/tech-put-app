// src/pages/admins/AdminUserPostsPage.tsx【新規作成】
// 管理者側のユーザー別動画投稿一覧ページ。
// 指定ユーザーが投稿した動画（YouTube）を一覧表示する。

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getCurrentAdmin,
  adminLogout,
  getUser,
  getAdminUserPosts,
  type Admin,
  type AdminPost,
} from "../../lib/adminApi"
import AdminLayout from "../../components/admin/AdminLayout"

// ISO形式の日時文字列を「YYYY年MM月DD日 HH:mm」形式に変換するユーティリティ
function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0") // 月は0始まりのため+1する
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

// 本文テキストを指定文字数で省略して表示するユーティリティ
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export default function AdminUserPostsPage() {
  const navigate = useNavigate()
  // URLパラメータからユーザーIDを取得する
  const { userId } = useParams<{ userId: string }>()

  const [admin, setAdmin] = useState<Admin | null>(null)
  // 画面見出しに表示するユーザー名
  const [userName, setUserName] = useState<string>("")
  // 対象ユーザーの動画投稿一覧
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)
  // データ取得失敗時に表示するエラーメッセージ（AdminUserTweetsPage と同じパターン）
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // 管理者ログイン確認。未ログインならログインページへリダイレクトする
      const currentAdmin = await getCurrentAdmin()
      if (cancelled) return
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true })
        return
      }
      setAdmin(currentAdmin)

      if (!userId) return

      try {
        // ユーザー情報と動画投稿一覧を並列取得する
        const [userInfo, userPosts] = await Promise.all([
          getUser(userId),
          getAdminUserPosts(userId),
        ])
        if (cancelled) return
        setUserName(userInfo.name)
        setPosts(userPosts)
      } catch {
        // 取得失敗時はエラーメッセージを表示する（ユーザー情報・動画投稿のどちらの失敗も含む）
        if (!cancelled) setError("データの取得に失敗しました")
      } finally {
        // 成功・失敗いずれもローディングを解除し、スピナーが回り続けるのを防ぐ
        if (!cancelled) setLoading(false)
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

  // データ取得中はスピナーを表示する
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* ページヘッダー: 戻るボタン・ユーザー名 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          ← 戻る
        </button>
        {/* 仕様書準拠でユーザー名に「さん」を付けて見出しを表示する */}
        <h4 className="mb-0">{userName}さんの動画投稿一覧</h4>
      </div>

      {/* エラーメッセージ（取得失敗時のみ表示） */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* 動画投稿一覧: 投稿がなければ空メッセージ、あればカード形式で表示 */}
      {/* エラー時は空メッセージを出さない（エラーアラートと二重表示を防ぐ） */}
      {posts.length === 0 ? (
        !error && <p className="text-muted text-center py-5">動画の投稿はまだありません</p>
      ) : (
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
              {posts.map((post) => (
                <tr key={post.id}>
                  {/* 動画タイトル */}
                  <td className="fw-semibold">{post.title}</td>
                  {/* 本文の先頭60文字をプレビュー表示する */}
                  <td className="text-muted">
                    {truncateText(post.body, 60)}
                  </td>
                  {/* YouTubeURLがある場合はリンクを表示する */}
                  <td>
                    {post.youtubeUrl ? (
                      <a
                        href={post.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger btn-sm"
                      >
                        YouTube
                      </a>
                    ) : (
                      // 仕様書準拠でURL未設定時は「―」を表示する
                      <span className="text-muted">―</span>
                    )}
                  </td>
                  {/* 投稿日時 */}
                  <td className="text-nowrap text-muted">
                    {formatDate(post.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
