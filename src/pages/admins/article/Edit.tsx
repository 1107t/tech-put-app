import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  getAdminArticle,
  updateAdminArticle,
  type Admin,
} from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";

export default function AdminArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleType, setArticleType] = useState("e-learning");
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { navigate("/admin/articles"); return; }
    let cancelled = false;
    (async () => {
      try {
        const [currentAdmin, article] = await Promise.all([
          getCurrentAdmin(),
          getAdminArticle(id),
        ]);
        if (cancelled) return;
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdmin(currentAdmin);
        if (!article) {
          setNotFound(true);
          return;
        }
        setTitle(article.title);
        setSubTitle(article.subTitle);
        setContent(article.content);
        setArticleType(article.articleType ?? "e-learning");
        setLoaded(true);
      } catch {
        if (!cancelled) {
          setLoadError("記事の読み込みに失敗しました。");
          setLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleUpdate = async () => {
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (title.trim().length > 40) { setError("タイトルは40文字以内で入力してください。"); return; }
    if (subTitle.trim().length > 50) { setError("サブタイトルは50文字以内で入力してください。"); return; }
    if (!content.trim()) { setError("本文を入力してください。"); return; }
    if (!id) return;
    setSubmitting(true);
    try {
      await updateAdminArticle(id, { title, subTitle, content, articleType });
      navigate("/admin/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の更新に失敗しました。"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded && !notFound) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout} headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}>
        <p className="text-danger">記事が見つかりませんでした。</p>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout} headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}>
        <p className="text-danger">{loadError}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout} headerBreadcrumb={{ label: "投稿した記事一覧", to: "/admin/articles" }}>
      <h4 className="mb-4">記事編集</h4>
      {error && <p className="text-danger mb-3">{error}</p>}
      <ArticleEditor
        title={title} onTitleChange={setTitle}
        subtitle={subTitle} onSubtitleChange={setSubTitle}
        body={content} onBodyChange={setContent}
        submitLabel="更新"
        onSubmit={handleUpdate}
        onCancel={() => navigate("/admin/articles")}
        disabled={submitting}
      />
    </AdminLayout>
  );
}
