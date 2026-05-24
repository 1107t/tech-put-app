import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardMenu } from "../../../lib/userMenus";
import UserLayout from "../../../components/user/UserLayout";
import { getAllArticles, deleteArticle, seedSampleArticles, type Article } from "../../../lib/articleDb";
import "../../../styles/pages/articleList.css";

export default function ArticleIndexPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  const load = async () => {
    await seedSampleArticles();  // main.tsxで開始済みのseedを待つ
    const data = await getAllArticles();
    setArticles(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    await deleteArticle(id);
    await load();
  };

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事一覧">
      <h2 className="h5 mb-4">記事一覧</h2>

      <div className="d-grid gap-3 article-list">
        {articles.map((article) => (
          <div key={article.id} className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between">
                <div className="fw-bold">{article.title}</div>
              </div>

              <div className="text-muted small mt-2">{article.subtitle}</div>

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <Link
                  className="btn btn-primary btn-sm"
                  to={`/articles/${article.id}/edit`}
                >
                  記事を見る
                </Link>
                <div className="d-flex gap-2">
                  <Link
                    className="btn btn-warning btn-sm"
                    to={`/articles/${article.id}/edit`}
                  >
                    編集
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(article.id!)}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
}
