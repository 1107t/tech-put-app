import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  getAdminArticle,
  deleteAdminArticle,
  type Admin,
  type AdminArticle,
} from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import MarkdownView from "../../../components/user/MarkdownView";

export default function AdminArticleShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { navigate("/admin/articles"); return; }
    let cancelled = false;
    (async () => {
      try {
        const [currentAdmin, data] = await Promise.all([
          getCurrentAdmin(),
          getAdminArticle(id),
        ]);
        if (cancelled) return;
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdmin(currentAdmin);
        if (!data) {
          navigate("/admin/articles");
          return;
        }
        setArticle(data);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoadError("記事の読み込みに失敗しました。");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleDelete = async () => {
    if (!window.confirm("この記事を削除しますか？")) return;
    if (!id) return;
    try {
      await deleteAdminArticle(id);
      navigate("/admin/articles");
    } catch (err) {
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

  if (loadError) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout} headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}>
        <p className="text-danger">{loadError}</p>
      </AdminLayout>
    );
  }

  if (!article) return null;

  return (
    <AdminLayout admin={admin} onLogout={handleLogout} headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}>
      <div className="row">
        <div className="col-md-10 offset-md-1">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h4 mb-1">{article.title}</h2>
                  <p className="text-muted mb-0">{article.subTitle}</p>
                </div>
                <div className="d-flex gap-2 ms-3 flex-shrink-0">
                  <Link
                    to={`/admin/articles/${id}/edit`}
                    className="btn btn-success btn-sm"
                  >
                    編集
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                  >
                    削除
                  </button>
                </div>
              </div>
              {error && <p className="text-danger mt-2 mb-0">{error}</p>}
              <hr />
              <MarkdownView body={article.content} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
