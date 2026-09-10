// src/components/manager/HeaderItem.tsx
import { useNavigate } from "react-router-dom";
import { type Manager } from "../../lib/managerApi";

type Props = {
  manager: Manager | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  title?: string;
  action?: React.ReactNode;
};

export default function HeaderItem({ manager, dropdownOpen, setDropdownOpen, onLogout, onToggleSidebar, title, action }: Props) {
  const navigate = useNavigate();

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
          aria-label="サイドバーを開閉"
        >
          <svg width="18" height="18" fill="#6c757d" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>
        {title && <span className="header-title-text">{title}</span>}
        {!title && <span className="header-title-text">マネージャー画面</span>}
      </div>

      {/* 右側：アクション＋アカウントアイコン＋ドロップダウン */}
      <div className="d-flex align-items-center gap-3">
        {action && <div>{action}</div>}
        <button
          type="button"
          className="btn btn-success btn-sm d-flex align-items-center gap-1"
          onClick={() => navigate("/manager/tenants/new")}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
          テナント追加
        </button>
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
                    {manager?.name || "アカウント"}
                  </div>
                </div>
                <hr style={{ margin: 0, borderColor: "#dee2e6" }} />
                <a
                  href="/manager/login"
                  className="d-block text-decoration-none"
                  style={{ padding: "8px 16px", fontSize: "14px", color: "#0d6efd" }}
                  onClick={(e) => { e.preventDefault(); setDropdownOpen(false); onLogout(); }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  ログアウト
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
