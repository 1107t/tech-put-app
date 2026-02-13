// src/pages/admins/AdminDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "../../lib/adminStore";

const Icon = ({ path, fillRule }: { path: string | string[]; fillRule?: "evenodd" }) => (
  <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
    {Array.isArray(path) ? (
      path.map((p, i) => <path key={i} d={p} fillRule={i === 1 ? fillRule : undefined} />)
    ) : (
      <path d={path} fillRule={fillRule} />
    )}
  </svg>
);

const SidebarItem = ({ icon, label, to }: { icon: string | string[]; label: string; to: string }) => (
  <li className="mb-2">
    <Link to={to} className="text-white text-decoration-none d-flex align-items-center">
      <Icon path={icon} fillRule={Array.isArray(icon) ? "evenodd" : undefined} />
      {label}
    </Link>
  </li>
);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      
      setAdmin(currentAdmin);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
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

  const menuItems = [
    {
      icon: "M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13.5 1h-11zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11zm7.293 1.146a.5.5 0 0 1 .414.073l3.5 2.5a.5.5 0 0 1 0 .816l-3.5 2.5A.5.5 0 0 1 9 9.25v-5a.5.5 0 0 1 .293-.604z",
      label: "記事一覧",
      to: "/admin/articles",
    },
    {
      icon: "M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z",
      label: "動画投稿一覧",
      to: "/admin/videos",
    },
    {
      icon: "M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      label: "各ユーザー一覧",
      to: "/admin/users",
    },
    {
      icon: "M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z",
      label: "問い合わせ一覧",
      to: "/admin/inquiries",
    },
  ];

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

  const tableColumns = [
    { label: "タイトル", width: "40%" },
    { label: "カテゴリ", width: "25%" },
    { label: "投稿者", width: "15%" },
    { label: "投稿日時", width: "20%" },
  ];

  return (
    <div className="min-vh-100 bg-light">
      <div className="d-flex">
        {/* サイドバー */}
        <div className="bg-dark text-white p-3" style={{ width: "250px", minHeight: "100vh" }}>
          <h4 className="mb-4">管理者画面</h4>
          
          {/* 検索ボックス */}
          <div className="mb-4">
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* メニュー項目 */}
          <ul className="list-unstyled">
            {menuItems.map((item, index) => (
              <SidebarItem key={index} icon={item.icon} label={item.label} to={item.to} />
            ))}
          </ul>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-grow-1 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">TOP画面</h2>
              <small className="text-muted">ようこそ、{admin?.name || admin?.email}さん</small>
            </div>

            {/* 右側：ログアウト＋アカウントアイコン */}
            <div className="d-flex align-items-center gap-3">
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger"
                type="button"
              >
                ログアウト
              </button>

              {/* アカウントアイコン（クリックで管理者詳細へ直接遷移） */}
              <button
                className="btn p-0 border-0"
                type="button"
                title="管理者詳細"
                onClick={() => navigate(`/admin/${admin?.id}`)}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    cursor: "pointer",
                  }}
                >
                  <svg width="22" height="22" fill="white" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path
                      fillRule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">記事一覧</h5>
              <div>
                <button className="btn btn-success btn-sm me-2">新規作成</button>
                <button className="btn btn-outline-secondary btn-sm">編集ボタン</button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      {tableColumns.map((col, index) => (
                        <th key={index} style={{ width: col.width }}>
                          {col.label}
                        </th>
                      ))}
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

          <div className="mt-3">
            <p className="text-muted small">
              <Icon
                path={[
                  "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z",
                  "m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
                ]}
              />
              編集ボタン、削除ボタンがあります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}