import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboardMenu } from "../../../lib/userMenus";
import UserLayout from "../../../components/user/UserLayout";
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

  useEffect(() => {
    if (!id) return;
    getArticle(Number(id)).then((article) => {
      if (!article) {
        setNotFound(true);
        return;
      }
      setTitle(article.title);
      setSubtitle(article.subtitle);
      setBody(article.body);
      setCreatedAt(article.createdAt);
    });
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim() || !id) return;
    await updateArticle(Number(id), { title, subtitle, body, createdAt });
    navigate("/articles");
  };

  if (notFound) {
    return (
      <UserLayout menu={dashboardMenu} headerTitle="記事編集">
        <p className="text-danger">記事が見つかりませんでした。</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事編集">
      <h2 className="h5 mb-4">記事編集</h2>
      <ArticleEditor
        title={title} onTitleChange={setTitle}
        subtitle={subtitle} onSubtitleChange={setSubtitle}
        body={body} onBodyChange={setBody}
        submitLabel="更新"
        onSubmit={handleUpdate}
        onCancel={() => navigate("/articles")}
      />
    </UserLayout>
  );
}
