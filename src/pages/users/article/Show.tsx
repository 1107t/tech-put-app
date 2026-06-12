import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import MarkdownView from "../../../components/user/MarkdownView";
import { getArticle, deleteArticle, type Article } from "../../../lib/articleApi";
import { getApiErrorMessage } from "../../../lib/api";
import "../../../styles/pages/articleShow.css";

export default function ArticleShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getArticle(id ?? "");
        if (!data) {
          navigate("/articles");
          return;
        }
        setArticle(data);
      } catch {
        setError("記事の読み込みに失敗しました。");
      }
    };
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("この記事を削除しますか？")) return;
    try {
      await deleteArticle(id ?? "");
      navigate("/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  if (error) {
    return (
      <UserLayout menu={dashboardMenu} headerTitle="記事詳細">
        {(_me) => <p className="text-danger">{error}</p>}
      </UserLayout>
    );
  }

  if (!article) return null;

  return (
    <UserLayout menu={dashboardMenu} headerTitle="記事詳細">
      {(me) => (
        <div className="row">
          <div className="col-md-10 offset-md-1">
            <div className="card article-show-card">
              <div className="card-body article-show-wrapper">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h1 className="article-show-title">{article.title}</h1>
                    <p className="article-show-subtitle">{article.subTitle}</p>
                  </div>
                  {article.userId === me.id && (
                    <div className="d-flex gap-2 ms-3 flex-shrink-0">
                      <Link to={`/articles/${id}/edit`} className="btn btn-success btn-sm">
                        編集
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        削除
                      </button>
                    </div>
                  )}
                </div>
                <hr />
                <div className="article-show-content">
                  <MarkdownView body={article.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
