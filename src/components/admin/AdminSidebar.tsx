// src/components/admin/AdminSidebar.tsx
// 管理画面の左サイドバー（タイトル・検索・メニュー・フッター）。
// レイアウトから切り出した専用コンポーネント。
import { useState } from "react";
import SidebarItem from "./SidebarItem";
import "../../styles/components/adminLayout.css";

// アイコンは Rails 版 admin サイドバーに合わせる
const menuItems = [
  { id: 1, label: "e-learning", to: "/admin/dashboard", icon: "fa-solid fa-book-open" },
  { id: 2, label: "記事一覧", to: "/admin/articles", icon: "fa-solid fa-table-cells" },
  { id: 3, label: "動画投稿一覧", to: "/admin/videos", icon: "fa-brands fa-youtube" },
  { id: 4, label: "登録ユーザー一覧", to: "/admin/users", icon: "fa-solid fa-list" },
  { id: 5, label: "問い合わせ一覧", to: "/admin/inquiries", icon: "fa-solid fa-list" },
];

export default function AdminSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="text-white p-3 d-flex flex-column admin-sidebar">
      <div className="mb-4 pb-3 admin-sidebar__title-area">
        <h5 className="mb-0 admin-sidebar__title">TecPutt管理画面</h5>
      </div>

      {/* 検索ボックス */}
      <div className="mb-4">
        <div className="input-group input-group-sm">
          <input
            type="text"
            className="form-control admin-search-input"
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn admin-search-btn" type="button">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* メニュー項目 */}
      <ul className="list-unstyled flex-grow-1 admin-sidebar-menu">
        {menuItems.map((item) => (
          <SidebarItem key={item.id} label={item.label} to={item.to} icon={item.icon} />
        ))}
      </ul>

      {/* フッター */}
      <div className="mt-auto pt-3 admin-sidebar__footer">
        <p className="text-muted mb-0 admin-sidebar__footer-text">
          Copyright © 2014-2021<br />
          AdminLTE.io<br />
          All rights reserved.
        </p>
      </div>
    </div>
  );
}
