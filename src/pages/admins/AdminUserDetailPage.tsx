// 受講生のプロフィール・投稿数と各投稿一覧への導線を表示する。
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { getAdminUser } from "../../lib/adminApi"
import type { AdminUser } from "../../lib/userTypes"
import { genderLabel } from "../../lib/userTypes"
import AdminLayout from "../../components/admin/AdminLayout"
import PageSpinner from "../../components/admin/PageSpinner"
import PageError from "../../components/admin/PageError"
import { useRequireAdmin } from "../../lib/useRequireAdmin"

export default function AdminUserDetailPage() {
  const navigate = useNavigate()
  const { id: userId } = useParams<{ id: string }>()
  const { admin, loading, error, handleLogout } = useRequireAdmin()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [userReady, setUserReady] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    if (!admin) return
    // ID変更時に前の受講生やエラーを持ち越さない。
    setUser(null)
    setUserError(null)
    setUserReady(false)
    if (!userId) {
      setUserReady(true)
      return
    }
    // ユーザー切り替え後や離脱後に古い取得結果を反映しない。
    let cancelled = false
    getAdminUser(userId)
      .then((userData) => {
        if (cancelled) return
        setUser(userData)
        setUserReady(true)
      })
      .catch((requestError: unknown) => {
        if (cancelled) return
        // 404は「見つからない」、それ以外は再試行可能なエラーとして扱う。
        if (!axios.isAxiosError(requestError) || requestError.response?.status !== 404) {
          setUserError("読み込みに失敗しました。時間をおいて再試行してください。")
        }
        setUserReady(true)
      })
    return () => { cancelled = true }
  }, [admin, userId])

  // 認証失敗時にスピナーが残らないよう、読み込み中より先に判定する。
  if (error) return <PageError message={error} />
  if (loading || !userReady) return <PageSpinner />
  if (userError) return <PageError message={userError} />

  if (!user) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-muted">ユーザーが見つかりません。</p>
        <button className="btn btn-secondary" onClick={() => navigate("/admin/users")}>
          一覧へ戻る
        </button>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* 見出し・一覧へ戻る導線 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/admin/users")}
        >
          ← 一覧へ戻る
        </button>
        <h4 className="mb-0">受講生詳細</h4>
      </div>

      {/* プロフィールと投稿数 */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-borderless mb-0">
            <tbody>
              <tr>
                <th className="text-muted" style={{ width: "160px" }}>名前</th>
                <td>{user.name}</td>
              </tr>
              <tr>
                <th className="text-muted">メールアドレス</th>
                <td>{user.email}</td>
              </tr>
              <tr>
                <th className="text-muted">性別</th>
                <td>{genderLabel(user.gender)}</td>
              </tr>
              <tr>
                <th className="text-muted">誕生日</th>
                <td>{user.birthday ?? "未設定"}</td>
              </tr>
              <tr>
                <th className="text-muted">登録日</th>
                <td>{new Date(user.createdAt).toLocaleDateString("ja-JP")}</td>
              </tr>

              <tr>
                <th className="text-muted">記事投稿数</th>
                <td>
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(`/admin/users/${user.id}/articles`)}
                  >
                    {user.articlesCount} 件
                  </button>
                </td>
              </tr>
              <tr>
                <th className="text-muted">動画投稿数</th>
                <td>
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(`/admin/users/${user.id}/posts`)}
                  >
                    {user.postsCount} 件
                  </button>
                </td>
              </tr>
              <tr>
                <th className="text-muted">つぶやき投稿数</th>
                <td>
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(`/admin/users/${user.id}/tweets`)}
                  >
                    {user.tweetsCount} 件
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
