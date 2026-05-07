// src/components/admin/AdminLayout.tsx
import { useState } from "react";
import { type Admin } from "../../lib/adminStore";
import SidebarItem from "./SidebarItem";
import HeaderItem from "./HeaderItem";

type Props = {
  admin: Admin | null;
  onLogout: () => void;
  children: React.ReactNode;
};

const menuItems = [
  { id: 1, label: "記事一覧", to: "/admin/articles" },
  { id: 2, label: "動画投稿一覧", to: "/admin/videos" },
  { id: 3, label: "登録ユーザー一覧", to: "/admin/users" },
  { id: 4, label: "問い合わせ一覧", to: "/admin/inquiries" },
];

export default function AdminLayout({ admin, onLogout, children }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="d-flex">
        {/* サイドバー */}
        <div
          className="text-white p-3 d-flex flex-column"
          style={{
            width: "250px",
            minHeight: "100vh",
            backgroundColor: "var(--shell-bg-admin)",
            position: "fixed",
            left: 0,
            top: 0,
          }}
        >
          <div className="mb-4 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
            <h5 className="mb-0" style={{ fontSize: "16px" }}>管理画面</h5>
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
                style={{ backgroundColor: "#2a2a2a", border: "none", color: "#fff" }}
              />
              <button
                className="btn"
                type="button"
                style={{ backgroundColor: "#2a2a2a", border: "none", color: "#fff" }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* メニュー項目 */}
          <ul className="list-unstyled flex-grow-1">
            {menuItems.map((item) => (
              <SidebarItem key={item.id} label={item.label} to={item.to} />
            ))}
          </ul>

          {/* フッター */}
          <div className="mt-auto pt-3" style={{ borderTop: "1px solid #2a2a2a" }}>
            <p className="text-muted mb-0" style={{ fontSize: "11px", lineHeight: "1.5" }}>
              Copyright © 2014-2021<br />
              AdminLTE.io<br />
              All rights reserved.
            </p>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
          {/* ヘッダー */}
          <HeaderItem
            admin={admin}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            onLogout={onLogout}
          />

          {/* 各ページ固有のコンテンツ */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}