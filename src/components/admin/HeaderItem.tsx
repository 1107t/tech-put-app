// src/components/admin/HeaderItem.tsx
import { Link } from "react-router-dom";
import { type Admin } from "../../lib/adminApi";

type Props = {
  admin: Admin | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  title?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; to: string };
};

export default function HeaderItem({ admin, dropdownOpen, setDropdownOpen, onLogout, onToggleSidebar, title, action, breadcrumb }: Props) {
  return (
    <div
      className="d-flex justify-content-between align-items-center px-4"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #dee2e6",
        height: "50px",
      }}
    >
      {/* 左側：ハンバーガー＋タイトル＋アクション */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="hamburger-btn me-3"
          onClick={onToggleSidebar}
        >
          <svg width="18" height="18" fill="#6c757d" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>
        {breadcrumb && (
          <Link
            to={breadcrumb.to}
            style={{ fontSize: "1.15rem", color: "#6c757d", textDecoration: "none", padding: "4px 10px", borderRadius: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e9ecef")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {breadcrumb.label}
          </Link>
        )}
        {title && <span style={{ fontSize: "1.15rem", color: "#6c757d", padding: "4px 10px" }}>{title}</span>}
        {!breadcrumb && !title && <span style={{ fontSize: "1.15rem", color: "#6c757d" }}>管理者詳細画面</span>}
      </div>

      {/* 右側：アクション＋アカウントアイコン＋ドロップダウン */}
      <div className="d-flex align-items-center gap-3">
        {action && <div>{action}</div>}
        <div className="position-relative">
          <button
            className="btn p-0 border-0"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
              </svg>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="shadow-sm"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "4px",
                  minWidth: "200px",
                  backgroundColor: "#fff",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  zIndex: 1001,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "10px 16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {admin?.name || "アカウント"}
                  </div>
                </div>
                <hr style={{ margin: 0, borderColor: "#dee2e6" }} />
                <Link
                  to={`/admin/${admin?.id}`}
                  className="d-block text-decoration-none"
                  style={{ padding: "8px 16px", fontSize: "14px", color: "#0d6efd" }}
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  詳細画面
                </Link>
                <Link
                  to="/admin/stocks"
                  className="d-block text-decoration-none"
                  style={{ padding: "8px 16px", fontSize: "14px", color: "#0d6efd" }}
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  ストック一覧
                </Link>
                <hr style={{ margin: 0, borderColor: "#dee2e6" }} />
                <Link
                  to="/admin/login"
                  className="d-block text-decoration-none"
                  style={{ padding: "8px 16px", fontSize: "14px", color: "#0d6efd" }}
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  ログアウト
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}