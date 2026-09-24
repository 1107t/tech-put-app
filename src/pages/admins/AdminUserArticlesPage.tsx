// 受講生別の記事一覧と記事詳細への導線を表示する。
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getUser,
  getAdminUserArticles,
  type AdminUserArticle,
} from "../../lib/adminApi"
import AdminLayout from "../../components/admin/AdminLayout"
import PageError from "../../components/admin/PageError"
import type { LoadStatus } from "../../lib/loadStatus"
import { useRequireAdmin } from "../../lib/useRequireAdmin"
import PageSpinner from "../../components/admin/PageSpinner"
import { formatDate } from "../../lib/formatDate"
import { buildUserPageHeading } from "../../lib/pageHeading"

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export default function AdminUserArticlesPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()

  const { admin, loading: authenticationLoading, error: authenticationError, handleLogout } = useRequireAdmin()
  const [userName, setUserName] = useState<string>("")
  const [articles, setArticles] = useState<AdminUserArticle[]>([])

  // 取得失敗を「投稿0件」と表示しないよう、読み込み状態を区別する。
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  useEffect(() => {
    if (!admin) return
    // ユーザー切り替え後や離脱後に古い取得結果を反映しない。
    let cancelled = false
    setLoadStatus("loading")
    ;(async () => {
      try {
        if (!userId) {
          if (!cancelled) setLoadStatus("failed")
          return
        }

        const [userInfo, userArticles] = await Promise.all([
          getUser(userId),
          getAdminUserArticles(userId),
        ])
        if (cancelled) return
        setUserName(userInfo.name)
        setArticles(userArticles)
        setLoadStatus("loaded")
      } catch {
        if (!cancelled) setLoadStatus("failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [admin, userId])

  // 認証失敗時にスピナーが残らないよう、読み込み中より先に判定する。
  if (authenticationError || loadStatus === "failed") {
    return <PageError message="データを取得できませんでした。" />
  }

  if (authenticationLoading || loadStatus === "loading") return <PageSpinner />

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* 見出し・戻る導線 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← 戻る
        </button>
        <h4 className="mb-0">{buildUserPageHeading(userName, "記事一覧")}</h4>
      </div>

      {/* 記事一覧 */}
      {articles.length === 0 ? (
        <p className="text-muted text-center py-5">記事の投稿はまだありません</p>
      ) : (
        <div className="card shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>タイトル</th>
                <th>内容（プレビュー）</th>
                <th>投稿日時</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  {/* 誤操作を避けるため、行全体ではなくタイトルだけを遷移対象にする。 */}
                  <td className="fw-semibold">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold text-start"
                      onClick={() => navigate(`/admin/articles/${article.id}`)}
                    >
                      {article.title}
                    </button>
                  </td>
                  <td className="text-muted">
                    {truncateText(article.content, 80)}
                  </td>
                  <td className="text-nowrap text-muted">
                    {formatDate(article.createdAt)}
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
