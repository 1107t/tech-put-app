// src/pages/admins/AdminUserDetailPage.tsx【修正】
// 受講生のプロフィールと投稿数を表示し、受講生別の投稿一覧へ案内する。
// 認証は共通フックに任せ、詳細取得の404と通信失敗を分けて表示する。

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

// URLの受講生IDに対応するプロフィールを取得して表示する。
export default function AdminUserDetailPage() {
  const navigate = useNavigate()
  const { id: userId } = useParams<{ id: string }>()
  const { admin, loading, error, handleLogout } = useRequireAdmin()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [userReady, setUserReady] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  // 管理者認証後に詳細を取得する。ID変更時は前の受講生・エラーを持ち越さない。
  useEffect(() => {
    if (!admin) return
    setUser(null)
    setUserError(null)
    setUserReady(false)
    if (!userId) {
      setUserReady(true)
      return
    }
    let cancelled = false
    getAdminUser(userId)
      .then((userData) => {
        if (cancelled) return
        setUser(userData)
        setUserReady(true)
      })
      .catch((requestError: unknown) => {
        if (cancelled) return
        // 404は「見つからない」と表示し、それ以外は再試行できるエラー画面へ進める。
        if (!axios.isAxiosError(requestError) || requestError.response?.status !== 404) {
          setUserError("読み込みに失敗しました。時間をおいて再試行してください。")
        }
        setUserReady(true)
      })
    return () => { cancelled = true }
  }, [admin, userId])

  // 認証と詳細取得の失敗を読み込み中から分け、スピナーが残り続けることを防ぐ。
  if (error) return <PageError message={error} />
  if (loading || !userReady) return <PageSpinner />
  if (userError) return <PageError message={userError} />

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
