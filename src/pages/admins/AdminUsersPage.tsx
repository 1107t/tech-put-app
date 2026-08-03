// src/pages/admins/AdminUsersPage.tsx【修正】
// 登録ユーザー一覧ページ。並べ替え・絞り込み検索・⋮メニュー（詳細・削除）機能を含む。
// 絞り込みと並べ替えはフロントエンド側のみで処理し、API再取得は行わない。

import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  getCurrentAdmin,
  adminLogout,
  getUsers,
  deleteUser,
  type Admin,
} from "../../lib/adminApi"
import type { AdminUser } from "../../lib/userTypes"
import AdminLayout from "../../components/admin/AdminLayout"
import { compareByCreatedAt, type SortOrder } from "../../lib/sort"

// 並べ替え基準の型定義（登録日 or 名前）
type SortCriteria = "createdAt" | "name"

// 絞り込み検索条件の型定義
interface FilterCondition {
  name: string       // 名前（部分一致）
  email: string      // メールアドレス（部分一致）
  fromDate: string   // 登録日（から）YYYY-MM-DD形式
  toDate: string     // 登録日（まで）YYYY-MM-DD形式
}

// 絞り込み条件の初期値（条件なし = 全件表示）
const EMPTY_FILTER: FilterCondition = { name: "", email: "", fromDate: "", toDate: "" }

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  // ⋮ドロップダウンメニューの開閉管理。開いている行のユーザーIDを保持する（nullで全て閉じた状態）
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null)

  // 削除処理中のユーザーID。連打による多重DELETEを防ぐガードとして使う（nullは処理中なし）
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 並べ替えモーダルの表示状態とモーダル内の選択値（一時的な入力値）
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortCriteriaInput, setSortCriteriaInput] = useState<SortCriteria>("createdAt")
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>("desc")
  // 実際に一覧に適用されている並べ替え条件（「並べ替える」ボタン押下で確定される）
  const [appliedSortCriteria, setAppliedSortCriteria] = useState<SortCriteria>("createdAt")
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>("desc")

  // 絞り込み検索モーダルの表示状態とモーダル内の入力値（一時的な入力値）
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterInput, setFilterInput] = useState<FilterCondition>(EMPTY_FILTER)
  // 実際に一覧に適用されている絞り込み条件（「検索する」ボタン押下で確定される）
  const [appliedFilter, setAppliedFilter] = useState<FilterCondition>(EMPTY_FILTER)

  // 管理者ログイン確認とユーザー一覧取得
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const currentAdmin = await getCurrentAdmin()
      if (cancelled) return
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true })
        return
      }
      setAdmin(currentAdmin)

      const allUsers = await getUsers()
      if (!cancelled) {
        setUsers(allUsers)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [navigate])

  // ⋮メニュー外のクリックでドロップダウンを閉じる処理
  useEffect(() => {
    const handleDocumentClick = () => setOpenMenuUserId(null)
    document.addEventListener("click", handleDocumentClick)
    return () => document.removeEventListener("click", handleDocumentClick)
  }, [])

  // 絞り込み → 並べ替えの順で適用した表示用ユーザー一覧を算出する
  const displayedUsers = useMemo(() => {
    // Step1: 絞り込み（各条件は空欄なら無視する）
    let filteredUsers = users.filter((user) => {
      if (appliedFilter.name && !user.name.includes(appliedFilter.name)) return false
      if (appliedFilter.email && !user.email.includes(appliedFilter.email)) return false
      // createdAt はISO 8601形式のため先頭10文字（YYYY-MM-DD）で日付比較する
      if (appliedFilter.fromDate && user.createdAt.slice(0, 10) < appliedFilter.fromDate) return false
      if (appliedFilter.toDate && user.createdAt.slice(0, 10) > appliedFilter.toDate) return false
      return true
    })

    // Step2: 並べ替え。名前は localeCompare('ja') で五十音順、登録日は共通の比較関数で時系列順に並べる
    // 比較関数はsort()呼び出し前に1回だけ生成し、コールバック内で再生成しないようにする
    const compareCreatedAt = compareByCreatedAt(appliedSortOrder)
    const sortedUsers = [...filteredUsers].sort((userA, userB) => {
      if (appliedSortCriteria === "name") {
        const compared = userA.name.localeCompare(userB.name, "ja")
        return appliedSortOrder === "asc" ? compared : -compared
      }
      return compareCreatedAt(userA, userB)
    })

    return sortedUsers
  }, [users, appliedFilter, appliedSortCriteria, appliedSortOrder])

  const handleLogout = async () => {
    await adminLogout()
    navigate("/admin/login", { replace: true })
  }

  // 受講生削除処理。確認ダイアログ → DELETE API → 一覧から該当行を即時削除する
  // deletingId で処理中フラグを持たせ、連打による多重DELETEを防ぐ
  const handleDelete = async (userId: string) => {
    if (deletingId || !window.confirm("本当に削除しますか？")) return
    setDeletingId(userId)
    try {
      await deleteUser(userId)
      // 削除成功後、一覧から該当ユーザーを除外して画面を更新する
      setUsers((previousUsers) => previousUsers.filter((user) => user.id !== userId))
    } catch {
      alert("削除に失敗しました。もう一度お試しください。")
    } finally {
      setDeletingId(null)
    }
    setOpenMenuUserId(null)
  }

  // 並べ替えモーダルを開く。現在の適用済み条件をモーダルの初期値として設定する
  const openSortModal = () => {
    setSortCriteriaInput(appliedSortCriteria)
    setSortOrderInput(appliedSortOrder)
    setShowSortModal(true)
  }

  // 並べ替えモーダルの「並べ替える」ボタン処理。入力値を適用済み条件として確定する
  const applySortModal = () => {
    setAppliedSortCriteria(sortCriteriaInput)
    setAppliedSortOrder(sortOrderInput)
    setShowSortModal(false)
  }

  // 絞り込み検索モーダルを開く。現在の適用済み条件をモーダルの初期値として設定する
  const openFilterModal = () => {
    setFilterInput(appliedFilter)
    setShowFilterModal(true)
  }

  // 絞り込み検索モーダルの「検索する」ボタン処理。入力値を適用済み条件として確定する
  const applyFilterModal = () => {
    setAppliedFilter(filterInput)
    setShowFilterModal(false)
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
      {/* ページタイトルと並べ替え・絞り込みボタン */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">登録ユーザー一覧</h4>
        <button className="btn btn-success btn-sm" onClick={openSortModal}>
          並べ替え
        </button>
        <button className="btn btn-success btn-sm" onClick={openFilterModal}>
          絞り込み検索
        </button>
      </div>

      {/* 登録ユーザー一覧テーブル */}
      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>名前</th>
              <th>email</th>
              <th>記事投稿数</th>
              <th>動画投稿数</th>
              <th>つぶやき投稿数</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  登録されているユーザーがいません
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  {/* 記事一覧ページは別PRで実装予定のため、当面は件数のみ表示 */}
                  <td>{user.articlesCount}</td>
                  {/* 動画一覧ページは別PRで実装予定のため、当面は件数のみ表示 */}
                  <td>{user.postsCount}</td>
                  <td>
                    {/* つぶやき数クリックでユーザー別つぶやき一覧へ遷移する */}
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/tweets`)}
                    >
                      {user.tweetsCount}
                    </button>
                  </td>
                  {/* ⋮ボタン列。position:relativeでドロップダウンの基準点にする */}
                  <td className="text-center position-relative">
                    {/* ⋮ボタン。stopPropagationでドキュメントへのclick伝播を止め、外クリック閉じと競合しないようにする */}
                    <button
                      className="btn btn-sm btn-link text-secondary p-0"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()
                        setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)
                      }}
                    >
                      ⋮
                    </button>
                    {/* ドロップダウンメニュー。対象ユーザーのIDが一致する行のみ表示する */}
                    {openMenuUserId === user.id && (
                      <div
                        className="dropdown-menu show"
                        style={{ position: "absolute", right: 0, top: "100%", zIndex: 1000, minWidth: "100px" }}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                      >
                        {/* 詳細ページは別PRで実装予定のため削除ボタンのみ表示 */}
                        {/* 削除：確認ダイアログ後に削除APIを呼び出す。処理中は無効化して連打による多重DELETEを防ぐ */}
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? "削除中..." : "削除"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 並べ替えモーダル */}
      {showSortModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">並べ替え</h5>
                </div>
                <div className="modal-body d-grid gap-3">
                  {/* 並べ替え基準セレクトボックス（登録日 or 名前） */}
                  <div>
                    <label className="form-label fw-semibold">並べ替え基準</label>
                    <select
                      className="form-select"
                      value={sortCriteriaInput}
                      onChange={(changeEvent) =>
                        setSortCriteriaInput(changeEvent.target.value as SortCriteria)
                      }
                    >
                      <option value="createdAt">登録日</option>
                      <option value="name">名前</option>
                    </select>
                  </div>
                  {/* 並べ替え順セレクトボックス（新しい順=降順 or 古い順=昇順） */}
                  <div>
                    <label className="form-label fw-semibold">並べ替え順</label>
                    <select
                      className="form-select"
                      value={sortOrderInput}
                      onChange={(changeEvent) =>
                        setSortOrderInput(changeEvent.target.value as SortOrder)
                      }
                    >
                      <option value="desc">新しい順</option>
                      <option value="asc">古い順</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowSortModal(false)}>
                    戻る
                  </button>
                  <button className="btn btn-success" onClick={applySortModal}>
                    並べ替える
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* モーダル背景オーバーレイ。クリックでモーダルを閉じる */}
          <div className="modal-backdrop fade show" onClick={() => setShowSortModal(false)} />
        </>
      )}

      {/* 絞り込み検索モーダル */}
      {showFilterModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">絞り込み検索</h5>
                </div>
                <div className="modal-body d-grid gap-3">
                  {/* 名前入力（部分一致） */}
                  <div>
                    <label className="form-label fw-semibold">名前</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="例：田中"
                      value={filterInput.name}
                      onChange={(changeEvent) =>
                        setFilterInput({ ...filterInput, name: changeEvent.target.value })
                      }
                    />
                  </div>
                  {/* メールアドレス入力（部分一致） */}
                  <div>
                    <label className="form-label fw-semibold">メールアドレス</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="例：example@gmail.com"
                      value={filterInput.email}
                      onChange={(changeEvent) =>
                        setFilterInput({ ...filterInput, email: changeEvent.target.value })
                      }
                    />
                  </div>
                  {/* 登録日（から）日付ピッカー */}
                  <div>
                    <label className="form-label fw-semibold">登録日（から）</label>
                    <input
                      type="date"
                      className="form-control"
                      value={filterInput.fromDate}
                      onChange={(changeEvent) =>
                        setFilterInput({ ...filterInput, fromDate: changeEvent.target.value })
                      }
                    />
                  </div>
                  {/* 登録日（まで）日付ピッカー */}
                  <div>
                    <label className="form-label fw-semibold">登録日（まで）</label>
                    <input
                      type="date"
                      className="form-control"
                      value={filterInput.toDate}
                      onChange={(changeEvent) =>
                        setFilterInput({ ...filterInput, toDate: changeEvent.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowFilterModal(false)}>
                    戻る
                  </button>
                  <button className="btn btn-success" onClick={applyFilterModal}>
                    検索する
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* モーダル背景オーバーレイ。クリックでモーダルを閉じる */}
          <div className="modal-backdrop fade show" onClick={() => setShowFilterModal(false)} />
        </>
      )}
    </AdminLayout>
  )
}
