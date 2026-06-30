import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  createAdminArticle,
  type Admin,
} from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";

export default function AdminArticlePostPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleType, setArticleType] = useState("e-learning");
  const [error, setError] = useState("");

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
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("読み込みに失敗しました。再読み込みしてください。");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (title.trim().length > 40) { setError("タイトルは40文字以内で入力してください。"); return; }
    if (subTitle.trim().length > 50) { setError("サブタイトルは50文字以内で入力してください。"); return; }
    if (!content.trim()) { setError("本文を入力してください。"); return; }
    setSubmitting(true);
    try {
      await createAdminArticle({ title, subTitle, content, articleType });
      navigate("/admin/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の保存に失敗しました。"));
    } finally {
      setSubmitting(false);
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
      headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}
    >
      <h4 className="mb-4">記事投稿</h4>
      {error && <p className="text-danger">{error}</p>}
      <ArticleEditor
        title={title} onTitleChange={setTitle}
        subtitle={subTitle} onSubtitleChange={setSubTitle}
        body={content} onBodyChange={setContent}
        submitLabel="投稿"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/articles")}
        disabled={submitting}
      />
    </AdminLayout>
  );
}
