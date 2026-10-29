// src/components/user/UserSidebar.tsx
// 受講生画面の左サイドバー（ロゴ・ユーザー名・メニュー・ログアウト）。
// レイアウトから切り出した専用コンポーネント。
import { NavLink } from "react-router-dom";
import type { User } from "../../lib/userTypes";
import UserSidebarItem from "./UserSidebarItem";
import "../../styles/components/userAvatar.css";

// サイドバーメニュー項目の型定義
export type MenuItem = {
  label: string; // 表示テキスト
  to: string;    // リンク先のパス
  icon: string;  // Font Awesome のアイコンクラス（Rails の nav-icon に合わせる）
};

type Props = {
  me: User;
  menu: MenuItem[];
  onLogout: () => void;
};

export default function UserSidebar({ me, menu, onLogout }: Props) {
  return (
    <aside className="user-sidebar">
      {/* ロゴエリア: アバターアイコンとサービス名 */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="user-avatar user-avatar--sm" />
        <div className="fw-bold">TecPutt</div>
      </div>

      {/* ユーザー名: プロフィールページへのリンク */}
      <div className="mb-3">
        <NavLink to={`/users/${me.id}`} className="text-white text-decoration-none">
          {me.name}
        </NavLink>
        <hr className="border-secondary mt-2 mb-0" />
      </div>

      {/* メニュー一覧: 現在ページを NavLink の isActive でハイライト */}
      <nav className="sidebar-menu">
        {menu.map((item) => (
          <UserSidebarItem key={item.to} label={item.label} to={item.to} icon={item.icon} />
        ))}
      </nav>

      {/* ログアウトボタン: サイドバー最下部に固定 */}
      <button className="btn btn-light w-100 mt-auto" onClick={onLogout}>
        ログアウト
      </button>
    </aside>
  );
}
