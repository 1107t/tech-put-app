import { useEffect, useState } from "react";
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
import "../../../styles/components/userLayout.css";

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
        <button className="btn btn-success btn-sm">並べ替え</button>
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
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  記事がありません
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr
                  key={article.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/articles/${article.id}`)}
                >
                  <td>{article.title}</td>
                  <td>{article.subTitle}</td>
                  <td>{formatDate(article.createdAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
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
    </AdminLayout>
  );
}
