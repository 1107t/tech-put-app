// 登録ユーザーの検索・並べ替え・個別画面への遷移と削除を提供する。
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../../lib/adminApi";
import type { AdminUser } from "../../lib/userTypes";
import AdminLayout from "../../components/admin/AdminLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";
import Modal from "../../components/admin/Modal";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import {
  createCreatedAtComparator,
  createNameComparator,
  isSortOrder,
  DEFAULT_SORT_ORDER,
  DATE_SORT_ORDER_OPTIONS,
  type SortOrder,
} from "../../lib/sort";
import FlashMessage from "../../components/admin/FlashMessage"
import { useFlash } from "../../lib/useFlash"
import type { LoadStatus } from "../../lib/loadStatus"

// 型と実行時の検証で、許可する並べ替え基準を共有する。
const SORT_CRITERIA = ["createdAt", "name"] as const
type SortCriterion = (typeof SORT_CRITERIA)[number]

function isSortCriterion(value: string): value is SortCriterion {
  return SORT_CRITERIA.some((sortCriterion) => sortCriterion === value)
}

const DEFAULT_SORT_CRITERION: SortCriterion = "createdAt"

interface FilterCondition {
  name: string       // 名前（部分一致）
  email: string      // メールアドレス（部分一致）
  fromDate: string   // 登録日（から）YYYY-MM-DD形式
  toDate: string     // 登録日（まで）YYYY-MM-DD形式
}

const EMPTY_FILTER: FilterCondition = { name: "", email: "", fromDate: "", toDate: "" }

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { admin, loading, error, handleLogout } = useRequireAdmin();
  const [users, setUsers] = useState<AdminUser[]>([])

  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  // 取得失敗はPageError、削除結果は一時通知に分ける。
  const { flash, showSuccessFlash, showErrorFlash, clearFlash } = useFlash()

  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  // キャンセル時に一覧を変えないよう、入力中と適用済みの条件を分ける。
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortCriterionInput, setSortCriterionInput] = useState<SortCriterion>(DEFAULT_SORT_CRITERION)
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>(DEFAULT_SORT_ORDER)
  const [appliedSortCriterion, setAppliedSortCriterion] = useState<SortCriterion>(DEFAULT_SORT_CRITERION)
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER)

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterInput, setFilterInput] = useState<FilterCondition>(EMPTY_FILTER)
  const [appliedFilter, setAppliedFilter] = useState<FilterCondition>(EMPTY_FILTER)

  useEffect(() => {
    if (!admin) return;
    // 離脱後に古い取得結果を反映しない。
    let cancelled = false;
    setLoadStatus("loading");
    getUsers()
      .then((allUsers) => {
        if (cancelled) return;
        setUsers(allUsers);
        setLoadStatus("loaded");
      })
      .catch(() => {
        if (!cancelled) setLoadStatus("failed");
      });
    return () => { cancelled = true; };
  }, [admin]);

  useEffect(() => {
    const handleDocumentClick = () => setOpenMenuUserId(null)
    document.addEventListener("click", handleDocumentClick)
    return () => document.removeEventListener("click", handleDocumentClick)
  }, [])

  // 検索と並べ替えは取得済みの一覧に適用し、APIを再取得しない。
  const displayedUsers = useMemo(() => {
    const filteredUsers = users.filter((user) => {
      if (appliedFilter.name && !user.name.includes(appliedFilter.name)) return false
      if (appliedFilter.email && !user.email.includes(appliedFilter.email)) return false
      // ISO 8601の先頭10文字を日付入力と同じYYYY-MM-DDで比較する。
      if (appliedFilter.fromDate && user.createdAt.slice(0, 10) < appliedFilter.fromDate) return false
      if (appliedFilter.toDate && user.createdAt.slice(0, 10) > appliedFilter.toDate) return false
      return true
    })

    const compareUsers =
      appliedSortCriterion === "name"
        ? createNameComparator(appliedSortOrder)
        : createCreatedAtComparator(appliedSortOrder)

    // filterで作った配列だけを並べ替え、usersのstateを直接変更しない。
    return filteredUsers.sort(compareUsers)
  }, [users, appliedFilter, appliedSortCriterion, appliedSortOrder])

  const handleDelete = async (userId: string) => {
    // 削除中の再操作による重複リクエストを防ぐ。
    if (deletingId || !window.confirm("本当に削除しますか？")) return
    setDeletingId(userId)
    try {
      await deleteUser(userId)
      setUsers((previousUsers) => previousUsers.filter((user) => user.id !== userId))
      showSuccessFlash("受講生を削除しました。")
    } catch {
      showErrorFlash("削除に失敗しました。もう一度お試しください。")
    } finally {
      setDeletingId(null)
      // 失敗時もメニューを閉じ、結果の通知を隠さない。
      setOpenMenuUserId(null)
    }
  }

  const openSortModal = () => {
    setSortCriterionInput(appliedSortCriterion)
    setSortOrderInput(appliedSortOrder)
    setShowSortModal(true)
  }

  const closeSortModal = () => {
    setShowSortModal(false)
  }

  const applySortModal = () => {
    setAppliedSortCriterion(sortCriterionInput)
    setAppliedSortOrder(sortOrderInput)
    closeSortModal()
  }

  const openFilterModal = () => {
    setFilterInput(appliedFilter)
    setShowFilterModal(true)
  }

  const closeFilterModal = () => {
    setShowFilterModal(false)
  }

  const applyFilterModal = () => {
    setAppliedFilter(filterInput)
    closeFilterModal()
  }

  if (error) {
    return <PageError message={error} />;
  }

  if (loading || loadStatus === "loading") {
    return <PageSpinner />;
  }

  // 取得失敗を「登録ユーザー0件」と表示しない。
  if (loadStatus === "failed") {
    return <PageError message="受講生一覧を取得できませんでした。" />
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* 削除結果の通知 */}
      <FlashMessage flash={flash} onClose={clearFlash} />

      {/* 見出し・検索条件 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">登録ユーザー一覧</h4>
        <button className="btn btn-success btn-sm" onClick={openSortModal}>
          並べ替え
        </button>
        <button className="btn btn-success btn-sm" onClick={openFilterModal}>
          絞り込み検索
        </button>
      </div>

      {/* 登録ユーザー一覧 */}
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
                  <td>
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/articles`)}
                    >
                      {user.articlesCount}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/posts`)}
                    >
                      {user.postsCount}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/tweets`)}
                    >
                      {user.tweetsCount}
                    </button>
                  </td>
                  <td className="text-center position-relative">
                    {/* 外クリックで閉じる処理と競合しないよう、メニュー内のクリック伝播を止める。 */}
                    <button
                      className="btn btn-sm btn-link text-secondary p-0"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()
                        setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)
                      }}
                    >
                      ⋮
                    </button>
                    {openMenuUserId === user.id && (
                      <div
                        className="dropdown-menu show"
                        style={{ position: "absolute", right: 0, top: "100%", zIndex: 1000, minWidth: "100px" }}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          詳細
                        </button>
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

      {/* 並べ替え条件 */}
      <Modal
        isOpen={showSortModal}
        onClose={closeSortModal}
        title="並べ替え"
        titleId="user-sort-modal-title"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeSortModal}>
              戻る
            </button>
            <button className="btn btn-success" onClick={applySortModal}>
              並べ替える
            </button>
          </>
        }
      >
        <div>
          <label htmlFor="user-sort-criteria-select" className="form-label fw-semibold">
            並べ替え基準
          </label>
          <select
            id="user-sort-criteria-select"
            className="form-select"
            value={sortCriterionInput}
            onChange={(changeEvent) => {
              const selectedValue = changeEvent.target.value
              if (isSortCriterion(selectedValue)) setSortCriterionInput(selectedValue)
            }}
          >
            <option value="createdAt">登録日</option>
            <option value="name">名前</option>
          </select>
        </div>
        <div>
          {/* TODO: 名前で並べ替える場合のラベルは、仕様確認後に日時用と分ける。 */}
          <label htmlFor="user-sort-order-select" className="form-label fw-semibold">
            並べ替え順
          </label>
          <select
            id="user-sort-order-select"
            className="form-select"
            value={sortOrderInput}
            onChange={(changeEvent) => {
              const selectedValue = changeEvent.target.value
              if (isSortOrder(selectedValue)) setSortOrderInput(selectedValue)
            }}
          >
            {DATE_SORT_ORDER_OPTIONS.map((sortOrderOption) => (
              <option key={sortOrderOption.value} value={sortOrderOption.value}>
                {sortOrderOption.label}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* 絞り込み条件 */}
      <Modal
        isOpen={showFilterModal}
        onClose={closeFilterModal}
        title="絞り込み検索"
        titleId="user-filter-modal-title"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeFilterModal}>
              戻る
            </button>
            <button className="btn btn-success" onClick={applyFilterModal}>
              検索する
            </button>
          </>
        }
      >
        <div>
          <label htmlFor="user-filter-name" className="form-label fw-semibold">
            名前
          </label>
          <input
            id="user-filter-name"
            type="text"
            className="form-control"
            placeholder="例：田中"
            value={filterInput.name}
            onChange={(changeEvent) =>
              setFilterInput({ ...filterInput, name: changeEvent.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="user-filter-email" className="form-label fw-semibold">
            メールアドレス
          </label>
          <input
            id="user-filter-email"
            type="text"
            className="form-control"
            placeholder="例：example@gmail.com"
            value={filterInput.email}
            onChange={(changeEvent) =>
              setFilterInput({ ...filterInput, email: changeEvent.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="user-filter-from-date" className="form-label fw-semibold">
            登録日（から）
          </label>
          <input
            id="user-filter-from-date"
            type="date"
            className="form-control"
            value={filterInput.fromDate}
            onChange={(changeEvent) =>
              setFilterInput({ ...filterInput, fromDate: changeEvent.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="user-filter-to-date" className="form-label fw-semibold">
            登録日（まで）
          </label>
          <input
            id="user-filter-to-date"
            type="date"
            className="form-control"
            value={filterInput.toDate}
            onChange={(changeEvent) =>
              setFilterInput({ ...filterInput, toDate: changeEvent.target.value })
            }
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}
