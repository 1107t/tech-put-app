 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "../../lib/adminStore";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentAdmin = await getCurrentAdmin();
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);
      setLoading(false);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  // ダミーの記事データ
  const articles = [
    {
      id: 1,
      title: "Rails基礎-2",
      category: "Ruby",
      author: "よろせか",
      date: "2024/08/27 17:43",
    },
    {
      id: 2,
      title: "Rails 基礎2_1 viewsについて",
      category: "Ruby Rails",
      author: "normal",
      date: "2024/07/21 19:18",
    },
    {
      id: 3,
      title: "Chatbotでは",
      category: "test",
      author: "よろせか",
      date: "2024/08/28 19:55",
    },
    {
      id: 4,
      title: "Rails基礎-1",
      category: "Rails",
      author: "アストセゾ",
      date: "2024/08/26 17:20",
    },
    {
      id: 5,
      title: "Rails 基礎3_1 Views-2ビット",
      category: "Ruby on Rails",
      author: "西岡 慶一",
      date: "2024/08/21 16:15",
    },
    {
      id: 6,
      title: "Rubyについて1",
      category: "Ruby 27課題 (1課)",
      author: "宮根 慶一",
      date: "2024/08/13 20:08",
    },
    {
      id: 7,
      title: "Rubyについて1",
      category: "Ruby",
      author: "宮根 慶一",
      date: "2024/08/13 16:07",
    },
  ];

  return (
    <div className="min-vh-100 bg-light">
      {/* サイドバー */}
      <div className="d-flex">
        <div className="bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
          <h4 className="mb-4">管理者画面</h4>
          <ul className="list-unstyled">
            <li className="mb-2">
              <a href="#" className="text-white text-decoration-none d-flex align-items-center">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
                  <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
                </svg>
                投稿管理画面
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-white text-decoration-none d-flex align-items-center">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>
                編集者管理一覧
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-white text-decoration-none d-flex align-items-center">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
                記事数管理一覧
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-white text-decoration-none d-flex align-items-center">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                </svg>
                画面分析管理一覧
              </a>
            </li>
          </ul>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-grow-1 p-4">
          {/* ヘッダー */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">TOP画面</h2>
              <small className="text-muted">ようこそ、{admin?.name || admin?.email}さん</small>
            </div>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              ログアウト
            </button>
          </div>

          {/* 記事一覧セクション */}
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">記事一覧</h5>
              <div>
                <button className="btn btn-success btn-sm me-2">
                  新規作成
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  編集ボタン
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }}>タイトル</th>
                      <th style={{ width: "25%" }}>カテゴリ</th>
                      <th style={{ width: "15%" }}>投稿者</th>
                      <th style={{ width: "20%" }}>投稿日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} style={{ cursor: "pointer" }}>
                        <td>{article.title}</td>
                        <td>{article.category}</td>
                        <td>{article.author}</td>
                        <td>{article.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 編集ボタン、削除ボタンがあります。テキスト */}
          <div className="mt-3">
            <p className="text-muted small">
              <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              編集ボタン、削除ボタンがあります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
