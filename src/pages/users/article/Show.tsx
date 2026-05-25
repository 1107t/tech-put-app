import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import UserLayout from "../../../components/user/UserLayout";
import { getArticle, deleteArticle, seedSampleArticles, type Article } from "../../../lib/articleDb";
import { dashboardMenu } from "../../../lib/userMenus";
import "../../../styles/pages/articleShow.css";

export default function ArticleShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const load = async () => {
      await seedSampleArticles();
      const data = await getArticle(Number(id));
      if (!data) {
        navigate("/articles");
        return;
      }
      setArticle(data);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("この記事を削除しますか？")) return;
    await deleteArticle(Number(id));
    navigate("/articles");
  };

  if (!article) return null;

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事詳細">
      <div className="row">
        <div className="col-md-10 offset-md-1">
          <div className="card article-show-card">
            <div className="card-body article-show-wrapper">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="article-show-title">{article.title}</h1>
                  <p className="article-show-subtitle">{article.subtitle}</p>
                </div>
                <div className="d-flex gap-2 ms-3 flex-shrink-0">
                  <Link to={`/articles/${id}/edit`} className="btn btn-success btn-sm">
                    編集
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                    削除
                  </button>
                </div>
              </div>
              <hr />
              <div className="article-show-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img({ src, alt }) {
                      return (
                        <a href={src ?? "#"} target="_blank" rel="noopener noreferrer">
                          {alt || "画像を表示"}
                        </a>
                      );
                    },
                  }}
                >
                  {article.body}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
