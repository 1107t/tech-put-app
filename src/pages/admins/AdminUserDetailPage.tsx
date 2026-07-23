// src/pages/admins/AdminUserDetailPage.tsx【新規作成】
// 受講生詳細ページ。管理者が個別の受講生のプロフィール・投稿数を確認する画面。
// URLパラメータ :id で受講生を特定し、GET /admin/users/:id からデータを取得する。

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCurrentAdmin, adminLogout, getUser, type Admin } from "../../lib/adminApi"
import type { AdminUser } from "../../lib/userTypes"
import { genderLabel } from "../../lib/userTypes"
import AdminLayout from "../../components/admin/AdminLayout"

export default function AdminUserDetailPage() {
  const navigate = useNavigate()
  // URLパラメータから受講生IDを取得する
  const { id } = useParams<{ id: string }>()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

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

      // 受講生詳細をAPIから取得する
      const fetchedUser = await getUser(id!)
      if (!cancelled) {
        setUser(fetchedUser)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [navigate, id])

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

  // ユーザーが見つからない場合のフォールバック表示
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
      {/* ページタイトルと一覧へ戻るボタン */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/admin/users")}
        >
          ← 一覧へ戻る
        </button>
        <h4 className="mb-0">受講生詳細</h4>
      </div>

      {/* 受講生情報カード */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-borderless mb-0">
            <tbody>
              {/* 基本プロフィール情報 */}
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
                {/* ISO 8601 形式の日時を日本語形式（例: 2024/1/15）に変換して表示する */}
                <td>{new Date(user.createdAt).toLocaleDateString("ja-JP")}</td>
              </tr>

              {/* 投稿数（件数クリックで各投稿一覧ページへ遷移する） */}
              <tr>
                <th className="text-muted">記事投稿数</th>
                {/* 記事数クリックでユーザー別記事一覧へ遷移する */}
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
                {/* 動画数クリックでユーザー別動画投稿一覧へ遷移する */}
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
                {/* つぶやき数クリックでユーザー別つぶやき一覧へ遷移する */}
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
