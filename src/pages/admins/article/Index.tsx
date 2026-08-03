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
import { compareByCreatedAt, type SortOrder } from "../../../lib/sort";

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
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>("desc");
  // 実際に一覧に適用されている並べ替え順序（「並べ替える」ボタン押下で確定される）
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>("desc");

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

  // 並べ替えを適用した表示用記事一覧を算出する。createdAtはISO 8601形式のため文字列比較で時系列順になる
  const displayedArticles = useMemo(() => {
    const sortedArticles = [...articles].sort(compareByCreatedAt(appliedSortOrder));
    return sortedArticles;
  }, [articles, appliedSortOrder]);

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

  // 並べ替えモーダルの「並べ替える」ボタン処理。入力値を適用済み順序として確定する
  const applySortModal = () => {
    setAppliedSortOrder(sortOrderInput);
    setShowSortModal(false);
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

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>タイトル</th>
              <th>サブタイトル</th>
              <th>投稿日時</th>
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
                  onClick={() => navigate(`/admin/articles/${article.id}`)}
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
                  {/* 並べ替え順セレクトボックス（新しい順=降順 or 古い順=昇順） */}
                  <div>
                    <label htmlFor="sort-order-select" className="form-label fw-semibold">
                      並べ替え順
                    </label>
                    <select
                      id="sort-order-select"
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
          <div
            className="modal-backdrop fade show"
            aria-label="モーダルを閉じる"
            onClick={() => setShowSortModal(false)}
          />
        </>
      )}
    </AdminLayout>
  );
}
