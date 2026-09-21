import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";
import { getArticle, updateArticle } from "../../../lib/articleApi";
import { getApiErrorMessage } from "../../../lib/api";

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getArticle(id)
      .then((article) => {
        if (!article) {
          setNotFound(true);
          return;
        }
        setTitle(article.title);
        setSubTitle(article.subTitle);
        setContent(article.content);
        setAuthorId(article.userId);
        setLoaded(true);
      })
      .catch(() => setError("記事の読み込みに失敗しました。"));
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!content.trim()) { setError("本文を入力してください。"); return; }
    if (!id) return;
    try {
      await updateArticle(id, { title, subTitle, content });
      navigate("/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の更新に失敗しました。"));
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
      {(me) => authorId !== me.id ? (
        <>
          <p className="text-danger">この記事を編集する権限がありません。</p>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/articles/${id}`)}>
            記事に戻る
          </button>
        </>
      ) : (
        <>
          <h2 className="h5 mb-4">記事編集</h2>
          {error && <p className="text-danger">{error}</p>}
          <ArticleEditor
            title={title} onTitleChange={setTitle}
            subtitle={subTitle} onSubtitleChange={setSubTitle}
            body={content} onBodyChange={setContent}
            submitLabel="更新"
            onSubmit={handleUpdate}
            onCancel={() => navigate("/articles")}
          />
        </>
      )}
    </UserLayout>
  );
}
