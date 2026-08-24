import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  getAdminArticles,
  deleteAdminArticle,
  type Admin,
  type AdminArticle,
} from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  createCreatedAtComparator,
  isSortOrder,
  DEFAULT_SORT_ORDER,
  DATE_SORT_ORDER_OPTIONS,
  DATE_SORT_ORDER_LABELS,
  type SortOrder,
} from "../../../lib/sort";
import Modal from "../../../components/admin/Modal";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${mo}/${day} ${h}:${min}`;
}

export default function AdminArticleIndexPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 並べ替えモーダルの表示状態とモーダル内の選択値（一時的な入力値）
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  // 実際に一覧に適用されている並べ替え順序（「並べ替える」ボタン押下で確定される）
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  // 並べ替えを実行したことの読み上げ文。初期表示では何も並べ替えていないので空にする
  const [sortAnnouncement, setSortAnnouncement] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        if (cancelled) return;
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdmin(currentAdmin);
        const data = await getAdminArticles();
        if (!cancelled) {
          setArticles(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("読み込みに失敗しました。再読み込みしてください。");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  // 並べ替えを適用した表示用記事一覧を算出する。元のarticles配列は変更しない
  const displayedArticles = useMemo(
    () => [...articles].sort(createCreatedAtComparator(appliedSortOrder)),
    [articles, appliedSortOrder]
  );

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    try {
      await deleteAdminArticle(id);
      setOpenMenuId(null);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setOpenMenuId(null);
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  // 並べ替えモーダルを開く。現在の適用済み順序をモーダルの初期値として設定する
  const openSortModal = () => {
    setSortOrderInput(appliedSortOrder);
    setShowSortModal(true);
  };

  // 並べ替えモーダルを閉じる共通処理。閉じる経路をここ1箇所に集約する。
  // ダブルクリックの2打目の握り潰しとフォーカス制御はModal側が持つため、ここでは状態だけを変える
  const closeSortModal = () => {
    setShowSortModal(false);
  };

  // 並べ替えモーダルの「並べ替える」ボタン処理。入力値を適用済み順序として確定して閉じる
  const applySortModal = () => {
    setAppliedSortOrder(sortOrderInput);
    setSortAnnouncement(`${DATE_SORT_ORDER_LABELS[sortOrderInput]}で並べ替えました`);
    closeSortModal();
  };

  // 記事詳細への遷移。
  // モーダルを閉じた2打目はModal側（閉じたときのクリーンアップ）で握り潰されるため、
  // ここでのガードは不要
  const handleRowClick = (articleId: string) => {
    navigate(`/admin/articles/${articleId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      headerTitle="投稿した記事一覧"
      headerAction={
        <Link to="/admin/articles/new" className="header-action-link">
          記事投稿
        </Link>
      }
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">記事一覧</h4>
        <button className="btn btn-success btn-sm" onClick={openSortModal}>
          並べ替え
        </button>
        {/* TODO: 絞り込み検索機能は別タスクで実装予定。ここではUI配置のみ */}
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {/* th の aria-sort は「いま何順か」、こちらは「たったいま並べ替わった」を伝える */}
      <p className="visually-hidden" role="status">
        {sortAnnouncement}
      </p>

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>タイトル</th>
              <th>サブタイトル</th>
              {/* 並べ替えが適用されている列であることと現在の順序を支援技術に伝える */}
              <th aria-sort={appliedSortOrder === "asc" ? "ascending" : "descending"}>投稿日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedArticles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  記事がありません
                </td>
              </tr>
            ) : (
              displayedArticles.map((article) => (
                <tr
                  key={article.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(article.id)}
                >
                  <td>{article.title}</td>
                  <td>{article.subTitle}</td>
                  <td>{formatDate(article.createdAt)}</td>
                  <td className="position-relative" onClick={(e) => e.stopPropagation()}>
                    <>
                      <button
                        className="btn btn-sm text-secondary p-0"
                        style={{ textDecoration: "none" }}
                        onClick={() =>
                          setOpenMenuId(openMenuId === article.id ? null : article.id)
                        }
                      >
                        ⋮
                      </button>
                      {openMenuId === article.id && (
                        <ul className="dropdown-menu show position-absolute">
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/admin/articles/${article.id}`}
                            >
                              閲覧
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/admin/articles/${article.id}/edit`}
                            >
                              編集
                            </Link>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(article.id)}
                            >
                              削除
                            </button>
                          </li>
                        </ul>
                      )}
                    </>
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
        titleId="sort-modal-title"
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
        {/* 並べ替え順セレクトボックス（新しい順=降順 or 古い順=昇順） */}
        <div>
          <label htmlFor="sort-order-select" className="form-label fw-semibold">
            並べ替え順
          </label>
          <select
            id="sort-order-select"
            className="form-select"
            value={sortOrderInput}
            onChange={(changeEvent) => {
              // 型ガードで絞り込む（詳細は sort.ts の isSortOrder）
              const selectedValue = changeEvent.target.value;
              if (isSortOrder(selectedValue)) setSortOrderInput(selectedValue);
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
    </AdminLayout>
  );
}
