// src/pages/admins/AdminUserArticlesPage.tsx【修正】
// 管理者側のユーザー別記事一覧ページ。
// 指定ユーザーが投稿した記事を一覧表示し、タイトルから記事詳細ページへ遷移できる。

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getCurrentAdmin,
  adminLogout,
  getUser,
  getAdminUserArticles,
  type Admin,
  type AdminUserArticle,
} from "../../lib/adminApi"
import AdminLayout from "../../components/admin/AdminLayout"
// ページ全体の読み込みに失敗したときの、本文に代わる恒久的なエラー表示。
// このページは閲覧専用で操作を持たないため、通知はこれだけでよく、フラッシュメッセージは使わない
import PageError from "../../components/admin/PageError"
import type { LoadStatus } from "../../lib/loadStatus"
// 日付整形はページ内の重複実装を廃止し、共通ユーティリティを使う（DRY原則）
import { formatDate } from "../../lib/formatDate"
// 見出し文言の組み立ても、兄弟の一覧ページと共通のユーティリティに寄せる
import { buildUserPageHeading } from "../../lib/pageHeading"

// 本文テキストを指定文字数で省略して表示するユーティリティ
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export default function AdminUserArticlesPage() {
  const navigate = useNavigate()
  // URLパラメータからユーザーIDを取得する
  const { userId } = useParams<{ userId: string }>()

  const [admin, setAdmin] = useState<Admin | null>(null)
  // 画面見出しに表示するユーザー名
  const [userName, setUserName] = useState<string>("")
  // 対象ユーザーの記事一覧
  const [articles, setArticles] = useState<AdminUserArticle[]>([])

  // ページ全体の読み込み状態。
  // 「読み込み中」と「失敗」を別々の boolean で持つと、失敗を表示しないまま
  // 空状態のメッセージ（＝0件と断定する文言）を出してしまう事故が起きる。
  // 1つの状態にまとめ、描画側で failed の分岐を必ず書くようにしている
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // 管理者ログイン確認。未ログインならログインページへリダイレクトする。
        // getCurrentAdmin は 401 のときだけ null を返し、500・タイムアウト・通信断では throw する。
        // try の外に置くと throw を捕まえられず、スピナーが回り続けるため必ず try の中で呼ぶ
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

        // ユーザー情報と記事一覧を並列取得する
        const [userInfo, userArticles] = await Promise.all([
          getUser(userId),
          getAdminUserArticles(userId),
        ])
        if (cancelled) return
        setUserName(userInfo.name)
        setArticles(userArticles)
        setLoadStatus("loaded")
      } catch {
        // ログイン確認・ユーザー情報・記事のいずれの失敗もここに来る。
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
      {/* ページヘッダー: 戻るボタン・ユーザー名 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← 戻る
        </button>
        {/* 仕様書準拠でユーザー名に「さん」を付けて見出しを表示する。
            名前が取得できなかった場合の文言は buildUserPageHeading が判断する */}
        <h4 className="mb-0">{buildUserPageHeading(userName, "記事一覧")}</h4>
      </div>

      {/* 記事一覧: 投稿がなければ空メッセージ、あれば表形式で表示。
          取得失敗はこの手前で PageError に分岐済みなので、ここは成功時だけを考えればよい */}
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
                  {/* 記事タイトル。クリックで記事詳細ページへ遷移する。
                      行全体ではなくタイトルだけをクリック対象にして、誤操作での遷移を避ける。
                      見た目は登録ユーザー一覧の件数リンクと同じ btn btn-link に揃える */}
                  <td className="fw-semibold">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold text-start"
                      onClick={() => navigate(`/admin/articles/${article.id}`)}
                    >
                      {article.title}
                    </button>
                  </td>
                  {/* 本文の先頭80文字をプレビュー表示する */}
                  <td className="text-muted">
                    {truncateText(article.content, 80)}
                  </td>
                  {/* 投稿日時 */}
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
