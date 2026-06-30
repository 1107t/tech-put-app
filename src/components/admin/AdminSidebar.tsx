// src/components/admin/AdminSidebar.tsx
// 管理画面の左サイドバー（タイトル・メニュー・フッター）。
// レイアウトから切り出した専用コンポーネント。
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
  return (
    <div className="text-white p-3 d-flex flex-column admin-sidebar">
      <div className="mb-4 pb-3 admin-sidebar__title-area">
        <h5 className="mb-0 admin-sidebar__title">TecPutt管理画面</h5>
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
