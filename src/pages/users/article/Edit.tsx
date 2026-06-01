import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";
import { getArticle, updateArticle } from "../../../lib/articleDb";

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getArticle(Number(id))
      .then((article) => {
        if (!article) {
          setNotFound(true);
          return;
        }
        setTitle(article.title);
        setSubtitle(article.subtitle);
        setBody(article.body);
        setCreatedAt(article.createdAt);
        setLoaded(true);
      })
      .catch(() => setError("記事の読み込みに失敗しました。"));
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim() || !id) return;
    try {
      await updateArticle(Number(id), { title, subtitle, body, createdAt });
      navigate("/articles");
    } catch {
      setError("記事の更新に失敗しました。");
    }
  };

  if (notFound) {
    return (
      <UserLayout menu={dashboardMenu} headerTitle="記事編集">
        {(_me) => <p className="text-danger">記事が見つかりませんでした。</p>}
      </UserLayout>
    );
  }

  if (error && !loaded) {
    return (
      <UserLayout menu={dashboardMenu} headerTitle="記事編集">
        {(_me) => <p className="text-danger">{error}</p>}
      </UserLayout>
    );
  }

  if (!loaded) {
    return (
      <UserLayout menu={dashboardMenu} headerTitle="記事編集">
        {(_me) => <p className="text-muted">読み込み中...</p>}
      </UserLayout>
    );
  }

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事編集">
      {(_me) => (
        <>
          <h2 className="h5 mb-4">記事編集</h2>
          {error && <p className="text-danger">{error}</p>}
          <ArticleEditor
            title={title} onTitleChange={setTitle}
            subtitle={subtitle} onSubtitleChange={setSubtitle}
            body={body} onBodyChange={setBody}
            submitLabel="更新"
            onSubmit={handleUpdate}
            onCancel={() => navigate("/articles")}
          />
        </>
      )}
    </UserLayout>
  );
}
