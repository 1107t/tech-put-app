import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardMenu } from "../../../lib/userMenus";
import UserLayout from "../../../components/user/UserLayout";
import ArticleEditor from "../../../components/user/ArticleEditor";
import { createArticle } from "../../../lib/articleDb";

export default function ArticlePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createArticle({ title, subtitle, body });
    navigate("/articles");
  };

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事投稿">
      <h2 className="h5 mb-4">記事投稿</h2>
      <ArticleEditor
        title={title} onTitleChange={setTitle}
        subtitle={subtitle} onSubtitleChange={setSubtitle}
        body={body} onBodyChange={setBody}
        submitLabel="投稿"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/articles")}
      />
    </UserLayout>
  );
}
