// src/pages/admins/AdminUsersPage.tsx【修正】
// 登録ユーザー一覧ページ。並べ替え・絞り込み検索・⋮メニュー（詳細・削除）機能を含む。
// 絞り込みと並べ替えはフロントエンド側のみで処理し、API再取得は行わない。

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
// 削除結果の通知と、取得失敗を区別する読み込み状態。
import FlashMessage from "../../components/admin/FlashMessage"
import { useFlash } from "../../lib/useFlash"
import type { LoadStatus } from "../../lib/loadStatus"

// 並べ替え基準として許容する値の一覧。型定義と実行時の検証の両方をここから導出する
const SORT_CRITERIA = ["createdAt", "name"] as const
// 並べ替え基準の型定義（登録日 or 名前）
type SortCriterion = (typeof SORT_CRITERIA)[number]

// 任意の文字列がSortCriterionかどうかを判定する型ガード。
// 並べ替え順（isSortOrder）と同じくDOM由来の値を型アサーションなしで絞り込むために使う
function isSortCriterion(value: string): value is SortCriterion {
  return SORT_CRITERIA.some((sortCriterion) => sortCriterion === value)
}

// 並べ替え基準の既定値。モーダルの初期表示と一覧の初期並び順の両方がこの定数を参照する。
// 並べ替え順のDEFAULT_SORT_ORDER（sort.ts）と対になる
const DEFAULT_SORT_CRITERION: SortCriterion = "createdAt"

// 絞り込み検索条件の型定義
interface FilterCondition {
  name: string       // 名前（部分一致）
  email: string      // メールアドレス（部分一致）
  fromDate: string   // 登録日（から）YYYY-MM-DD形式
  toDate: string     // 登録日（まで）YYYY-MM-DD形式
}

// 絞り込み条件の初期値（条件なし = 全件表示）
const EMPTY_FILTER: FilterCondition = { name: "", email: "", fromDate: "", toDate: "" }

// 共通の管理者認証後、一覧の検索・並べ替え・個別画面への遷移と削除を提供する。
export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { admin, loading, error, handleLogout } = useRequireAdmin();
  const [users, setUsers] = useState<AdminUser[]>([])

  // 【修正】ページ全体の読み込み状態。
  // 「読み込み中」と「失敗」を別々の boolean で持つと、失敗を表示しないまま
  // 空状態のメッセージ（「登録されているユーザーがいません」＝0件と断定する文言）を
  // 出してしまう事故が起きる。1つの状態にまとめ、描画側で failed の分岐を必ず書くようにしている
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")

  // 【修正】削除操作の結果の通知（成功=緑 / エラー=赤）。
  // 読み込みの失敗は PageError が担うため、フラッシュは操作の結果だけに使う
  const { flash, showSuccessFlash, showErrorFlash, clearFlash } = useFlash()

  // ⋮ドロップダウンメニューの開閉管理。開いている行のユーザーIDを保持する（nullで全て閉じた状態）
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null)

  // 削除処理中のユーザーID。連打による多重DELETEを防ぐガードとして使う（nullは処理中なし）
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 並べ替えモーダルの表示状態とモーダル内の選択値（一時的な入力値）
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortCriterionInput, setSortCriterionInput] = useState<SortCriterion>(DEFAULT_SORT_CRITERION)
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>(DEFAULT_SORT_ORDER)
  // 実際に一覧に適用されている並べ替え条件（「並べ替える」ボタン押下で確定される）
  const [appliedSortCriterion, setAppliedSortCriterion] = useState<SortCriterion>(DEFAULT_SORT_CRITERION)
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER)

  // 絞り込み検索モーダルの表示状態とモーダル内の入力値（一時的な入力値）
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterInput, setFilterInput] = useState<FilterCondition>(EMPTY_FILTER)
  // 実際に一覧に適用されている絞り込み条件（「検索する」ボタン押下で確定される）
  const [appliedFilter, setAppliedFilter] = useState<FilterCondition>(EMPTY_FILTER)

  // ユーザー一覧取得（管理者認証確認後）
  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    setLoadStatus("loading");
    // 認証は共通フックが担い、ここでは一覧の取得成功・失敗を必ず確定する。
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

  // ⋮メニュー外のクリックでドロップダウンを閉じる処理
  useEffect(() => {
    const handleDocumentClick = () => setOpenMenuUserId(null)
    document.addEventListener("click", handleDocumentClick)
    return () => document.removeEventListener("click", handleDocumentClick)
  }, [])

  // 絞り込み → 並べ替えの順で適用した表示用ユーザー一覧を算出する
  const displayedUsers = useMemo(() => {
    // Step1: 絞り込み（各条件は空欄なら無視する）
    const filteredUsers = users.filter((user) => {
      if (appliedFilter.name && !user.name.includes(appliedFilter.name)) return false
      if (appliedFilter.email && !user.email.includes(appliedFilter.email)) return false
      // createdAt はISO 8601形式のため先頭10文字（YYYY-MM-DD）で日付比較する
      if (appliedFilter.fromDate && user.createdAt.slice(0, 10) < appliedFilter.fromDate) return false
      if (appliedFilter.toDate && user.createdAt.slice(0, 10) > appliedFilter.toDate) return false
      return true
    })

    // Step2: 並べ替え。どちらの基準を使うかはsort()の前に1回だけ決め、
    // コールバック内では基準の分岐も比較関数の生成も行わない
    const compareUsers =
      appliedSortCriterion === "name"
        ? createNameComparator(appliedSortOrder)
        : createCreatedAtComparator(appliedSortOrder)

    // filter は新しい配列を返すため、users state を壊さずそのまま並べ替えられる
    return filteredUsers.sort(compareUsers)
  }, [users, appliedFilter, appliedSortCriterion, appliedSortOrder])

  // 受講生削除処理。確認ダイアログ → DELETE API → 一覧から該当行を即時削除する
  // deletingId で処理中フラグを持たせ、連打による多重DELETEを防ぐ
  const handleDelete = async (userId: string) => {
    if (deletingId || !window.confirm("本当に削除しますか？")) return
    setDeletingId(userId)
    try {
      await deleteUser(userId)
      // 削除成功後、一覧から該当ユーザーを除外して画面を更新する
      setUsers((previousUsers) => previousUsers.filter((user) => user.id !== userId))
      // 【修正】削除できたことを成功フラッシュ（緑）で明示する
      showSuccessFlash("受講生を削除しました。")
    } catch {
      // 【修正】ブラウザ標準の window.alert をやめ、画面内のエラーフラッシュ（赤）に置き換えた
      showErrorFlash("削除に失敗しました。もう一度お試しください。")
    } finally {
      setDeletingId(null)
      // 【修正】成功・失敗（catch）のどちらでも ⋮メニューを閉じる。
      // 失敗時にメニューが開いたままだと、画面上部のエラーフラッシュに重なって見づらくなるため
      setOpenMenuUserId(null)
    }
  }

  // 並べ替えモーダルを開く。現在の適用済み条件をモーダルの初期値として設定する
  const openSortModal = () => {
    setSortCriterionInput(appliedSortCriterion)
    setSortOrderInput(appliedSortOrder)
    setShowSortModal(true)
  }

  // 並べ替えモーダルを閉じる共通処理。「戻る」ボタン・背景クリック・Escキーから呼ばれる
  const closeSortModal = () => {
    setShowSortModal(false)
  }

  // 並べ替えモーダルの「並べ替える」ボタン処理。入力値を適用済み条件として確定する
  const applySortModal = () => {
    setAppliedSortCriterion(sortCriterionInput)
    setAppliedSortOrder(sortOrderInput)
    closeSortModal()
  }

  // 絞り込み検索モーダルを開く。現在の適用済み条件をモーダルの初期値として設定する
  const openFilterModal = () => {
    setFilterInput(appliedFilter)
    setShowFilterModal(true)
  }

  // 絞り込み検索モーダルを閉じる共通処理。「戻る」ボタン・背景クリック・Escキーから呼ばれる
  const closeFilterModal = () => {
    setShowFilterModal(false)
  }

  // 絞り込み検索モーダルの「検索する」ボタン処理。入力値を適用済み条件として確定する
  const applyFilterModal = () => {
    setAppliedFilter(filterInput)
    closeFilterModal()
  }

  if (error) {
    return <PageError message={error} />;
  }

  // データ取得中はスピナーを表示する
  if (loading || loadStatus === "loading") {
    return <PageSpinner />;
  }

  // 【修正】取得に失敗したときは、本文の代わりにエラー画面を出す。
  // ここで止めないと「登録されているユーザーがいません」と表示され、
  // 実際には登録があるのに0件だと断定して伝えてしまう
  if (loadStatus === "failed") {
    return <PageError message="受講生一覧を取得できませんでした。" />
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      {/* 【修正】削除操作の結果の通知（成功=緑 / エラー=赤）。見出しのすぐ上に置く */}
      <FlashMessage flash={flash} onClose={clearFlash} />

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
                  <td>
                    {/* 記事数クリックでユーザー別記事一覧へ遷移する（つぶやき数と同一パターン） */}
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/articles`)}
                    >
                      {user.articlesCount}
                    </button>
                  </td>
                  <td>
                    {/* 動画数クリックでユーザー別動画投稿一覧へ遷移する（つぶやき数と同一パターン） */}
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/posts`)}
                    >
                      {user.postsCount}
                    </button>
                  </td>
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
                        {/* 詳細：クリックで受講生詳細ページへ遷移する。削除項目の上に配置する */}
                        <button
                          className="dropdown-item"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          詳細
                        </button>
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

      {/* 並べ替えモーダル。骨格・背景クリック・Esc・フォーカス制御は共通のModalが持つ */}
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
        {/* 並べ替え基準セレクトボックス（登録日 or 名前） */}
        <div>
          <label htmlFor="user-sort-criteria-select" className="form-label fw-semibold">
            並べ替え基準
          </label>
          <select
            id="user-sort-criteria-select"
            className="form-select"
            value={sortCriterionInput}
            onChange={(changeEvent) => {
              // 並べ替え順のセレクトと同じく、型ガードでSortCriterionへ絞り込んでから反映する。
              // 選択肢を増やすときはSORT_CRITERIAにも必ず追加すること
              const selectedValue = changeEvent.target.value
              if (isSortCriterion(selectedValue)) setSortCriterionInput(selectedValue)
            }}
          >
            <option value="createdAt">登録日</option>
            <option value="name">名前</option>
          </select>
        </div>
        {/* 並べ替え順セレクトボックス（新しい順=降順 or 古い順=昇順）。
            基準に「名前」を選んでも日時基準のラベルのままになる問題が残っている。
            基準ごとの選択肢の出し分けは、文言の仕様確認が必要なため別タスクとする */}
        <div>
          <label htmlFor="user-sort-order-select" className="form-label fw-semibold">
            並べ替え順
          </label>
          <select
            id="user-sort-order-select"
            className="form-select"
            value={sortOrderInput}
            onChange={(changeEvent) => {
              // 型ガードで絞り込む（詳細は sort.ts の isSortOrder）
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

      {/* 絞り込み検索モーダル。骨格・背景クリック・Esc・フォーカス制御は共通のModalが持つ */}
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
        {/* 名前入力（部分一致） */}
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
        {/* メールアドレス入力（部分一致） */}
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
        {/* 登録日（から）日付ピッカー */}
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
        {/* 登録日（まで）日付ピッカー */}
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
