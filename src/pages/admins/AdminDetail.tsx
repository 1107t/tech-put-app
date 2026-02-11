// src/pages/admins/AdminDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "../../lib/adminStore";

const SidebarItem = ({
  label,
  to,
  active,
}: {
  label: string;
  to: string;
  active?: boolean;
}) => (
  <li className="mb-2">
    <Link
      to={to}
      className={`text-white text-decoration-none d-flex align-items-center py-2 px-3 rounded ${
        active ? "bg-secondary" : ""
      }`}
      style={{ fontSize: "14px" }}
    >
      <span className="me-2" style={{ fontSize: "10px" }}>
        ■
      </span>
      {label}
    </Link>
  </li>
);

export default function AdminDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
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
      label: "記事一覧",
      to: "/admin/articles",
    },
    {
      label: "動画投稿一覧",
      to: "/admin/videos",
    },
    {
      label: "登録ユーザー一覧",
      to: "/admin/users",
    },
    {
      label: "問い合わせ一覧",
      to: "/admin/inquiries",
    },
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="d-flex">
        {/* サイドバー */}
        <div
          className="text-white p-3 d-flex flex-column"
          style={{
            width: "250px",
            minHeight: "100vh",
            backgroundColor: "#1a1a1a",
            position: "fixed",
            left: 0,
            top: 0,
          }}
        >
          <div
            className="mb-4 pb-3"
            style={{ borderBottom: "1px solid #2a2a2a" }}
          >
            <h5 className="mb-0" style={{ fontSize: "16px" }}>
              管理画面
            </h5>
          </div>

          {/* 検索ボックス */}
          <div className="mb-4">
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "none",
                  color: "#fff",
                }}
              />
              <button
                className="btn"
                type="button"
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "none",
                  color: "#fff",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* メニュー項目 */}
          <ul className="list-unstyled flex-grow-1">
            {menuItems.map((item, index) => (
              <SidebarItem key={index} label={item.label} to={item.to} />
            ))}
          </ul>

          {/* フッター */}
          <div
            className="mt-auto pt-3"
            style={{ borderTop: "1px solid #2a2a2a" }}
          >
            <p
              className="text-muted mb-0"
              style={{ fontSize: "11px", lineHeight: "1.5" }}
            >
              Copyright © 2014-2021
              <br />
              AdminLTE.io
              <br />
              All rights reserved.
            </p>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
          {/* ヘッダー */}
          <div
            className="d-flex justify-content-between align-items-center px-4 py-3"
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #dee2e6",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div>
              <h4
                className="mb-0"
                style={{ fontSize: "20px", fontWeight: "500" }}
              >
                管理者詳細{" "}
                {id && (
                  <span className="text-muted" style={{ fontSize: "14px" }}>
                    （ID: {id}）
                  </span>
                )}
              </h4>
              <small className="text-muted" style={{ fontSize: "13px" }}>
                ようこそ、{admin?.name || admin?.email}さん
              </small>
            </div>

            {/* 右側のアイコン群 */}
            <div className="d-flex align-items-center gap-3">
              {/* ログアウトボタン */}
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
                type="button"
                style={{
                  fontSize: "13px",
                  padding: "6px 16px",
                  borderRadius: "4px",
                }}
              >
                ログアウト
              </button>

              {/* アカウントアイコン */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ border: "none" }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "36px",
                      height: "36px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="white"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path
                        fillRule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                      />
                    </svg>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <div className="dropdown-item-text">
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>
                        {admin?.name || "アカウント"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6c757d" }}>
                        {admin?.email}
                      </div>
                    </div>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      type="button"
                    >
                      ログアウト
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* メインコンテンツエリア */}
          <div className="p-4">
            {/* 管理者詳細画面（中央配置） */}
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className="card shadow-sm">
                  <div
                    className="card-body d-flex flex-column"
                    style={{ minHeight: "500px" }}
                  >
                    <div
                      className="text-center pb-3 mb-4"
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      <h5 className="mb-0">管理者詳細画面</h5>
                    </div>

                    <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                      {/* アバター */}
                      <div className="position-relative mb-4">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "120px",
                            height: "120px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          }}
                        >
                          <svg
                            width="70"
                            height="70"
                            fill="white"
                            viewBox="0 0 16 16"
                          >
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            <path
                              fillRule="evenodd"
                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                            />
                          </svg>
                        </div>

                        {/* 追加ボタン */}
                        <button
                          className="btn btn-primary rounded-circle p-0 position-absolute"
                          style={{
                            width: "36px",
                            height: "36px",
                            bottom: "0",
                            right: "0",
                            border: "3px solid white",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="white"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                          </svg>
                        </button>
                      </div>

                      {/* 管理者情報 */}
                      <div className="text-center">
                        {admin?.name && (
                          <h6
                            className="mb-2"
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            {admin.name}
                          </h6>
                        )}
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "15px" }}
                        >
                          {admin?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}