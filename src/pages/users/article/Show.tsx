import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import MarkdownView from "../../../components/user/MarkdownView";
import { getArticle, deleteArticle, likeArticle, unlikeArticle, type Article } from "../../../lib/articleApi";
import { getApiErrorMessage } from "../../../lib/api";
import "../../../styles/pages/articleShow.css";

export default function ArticleShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) { navigate("/articles"); return; }
      try {
        const data = await getArticle(id);
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
    if (!id) { navigate("/articles"); return; }
    try {
      await deleteArticle(id);
      navigate("/articles");
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  const handleLikeToggle = async () => {
    if (!article) return;
    setIsLiking(true);
    setLikeError("");
    try {
      if (article.likedByCurrentUser) {
        await unlikeArticle(article.id);
      } else {
        await likeArticle(article.id);
      }
      // いいね数は他の受講生の操作でも変わるため、サーバーの値を取り直す
      const latestArticle = await getArticle(article.id);
      if (latestArticle) setArticle(latestArticle);
    } catch (err) {
      setLikeError(getApiErrorMessage(err, "いいねの更新に失敗しました。"));
    } finally {
      setIsLiking(false);
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
                    <button
                      type="button"
                      className={`btn btn-sm ${article.likedByCurrentUser ? "btn-danger" : "btn-outline-danger"}`}
                      onClick={handleLikeToggle}
                      disabled={isLiking}
                      aria-pressed={article.likedByCurrentUser}
                    >
                      <i className={`${article.likedByCurrentUser ? "fa-solid" : "fa-regular"} fa-heart me-1`} aria-hidden="true" />
                      いいね {article.likesCount}
                    </button>
                    {likeError && <p className="text-danger small mt-2 mb-0">{likeError}</p>}
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
