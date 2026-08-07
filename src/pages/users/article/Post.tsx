import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";
import { createArticle } from "../../../lib/articleApi";
import { getApiErrorMessage } from "../../../lib/api";

export default function ArticlePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!content.trim()) { setError("本文を入力してください。"); return; }
    try {
      await createArticle({ title, subTitle, content });
      navigate("/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の保存に失敗しました。"));
    }
  };

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事投稿">
      {(_me) => (
        <>
          <h2 className="h5 mb-4">記事投稿</h2>
          {error && <p className="text-danger">{error}</p>}
          <ArticleEditor
            title={title} onTitleChange={setTitle}
            subtitle={subTitle} onSubtitleChange={setSubTitle}
            body={content} onBodyChange={setContent}
            submitLabel="投稿"
            onSubmit={handleSubmit}
            onCancel={() => navigate("/articles")}
          />
        </>
      )}
    </UserLayout>
  );
}
