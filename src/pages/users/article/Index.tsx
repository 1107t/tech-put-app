import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import { getAllArticles, deleteArticle, type Article } from "../../../lib/articleApi";
import { getApiErrorMessage } from "../../../lib/api";
import "../../../styles/pages/articleList.css";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${mo}/${day} ${h}:${min}`;
}

export default function ArticleIndexPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch {
      setError("記事の読み込みに失敗しました。");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    try {
      await deleteArticle(id);
      setOpenMenuId(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  return (
    <UserLayout
      menu={dashboardMenu}
      headerTitle="投稿した記事一覧"
      headerAction={<Link to="/articles/new" className="header-action-link">記事投稿</Link>}
    >
      {(me) => (
        <>
          {error && <p className="text-danger">{error}</p>}
          <h2 className="article-list-title mb-4">記事一覧</h2>

          <div className="articles-table-wrapper">
            <table className="table articles-table table-hover">
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>サブタイトル</th>
                  <th>投稿者</th>
                  <th>投稿日時</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="article-row"
                    onClick={() => navigate(`/articles/${article.id}`)}
                  >
                    <td className="link-td">{article.title}</td>
                    <td className="link-td">{article.subTitle}</td>
                    <td className="link-td"></td>
                    <td className="link-td">{formatDate(article.createdAt)}</td>
                    <td className="menu-td" onClick={(e) => e.stopPropagation()}>
                      {article.userId === me.id && (
                        <>
                          <button
                            className="btn menu-btn"
                            onClick={() =>
                              setOpenMenuId(openMenuId === article.id ? null : article.id)
                            }
                          >
                            ︙
                          </button>
                          {openMenuId === article.id && (
                            <ul className="dropdown-menu show">
                              <li>
                                <Link
                                  className="nav-link"
                                  to={`/articles/${article.id}/edit`}
                                >
                                  編集
                                </Link>
                              </li>
                              <li>
                                <button
                                  className="nav-link delete-btn"
                                  onClick={() => handleDelete(article.id)}
                                >
                                  削除
                                </button>
                              </li>
                            </ul>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </UserLayout>
  );
}
