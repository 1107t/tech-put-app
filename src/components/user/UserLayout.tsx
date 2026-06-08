// src/components/user/UserLayout.tsx【修正】
// サイドバー・ヘッダー・メインコンテンツを組み合わせたページ共通レイアウト。
// render-prop パターンで me を子に渡すため、子側で useRequireAuth を二重呼び出しする必要がない。
import { NavLink } from "react-router-dom";
import type { User } from "../../lib/userTypes";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";
import "../../styles/components/userAvatar.css";

// サイドバーメニュー項目の型定義
export type MenuItem = {
  label: string; // 表示テキスト
  to: string;    // リンク先のパス
  icon: string;  // Font Awesome のアイコンクラス（Rails の nav-icon に合わせる）
};

// 受講生ダッシュボード共通メニュー（全ページで共有）。アイコンは Rails 版に合わせる。
export const dashboardMenu: MenuItem[] = [
  { label: "e-learning", to: "/dashboard", icon: "fa-solid fa-book-open" },
  { label: "記事一覧", to: "/articles", icon: "fa-solid fa-newspaper" },
  { label: "プロフィール一覧", to: "/profiles", icon: "fa-solid fa-address-card" },
  { label: "動画投稿一覧", to: "/videos", icon: "fa-brands fa-youtube" },
  { label: "つぶやき一覧", to: "/tweets", icon: "fa-brands fa-twitter" },
  { label: "問い合わせ", to: "/inquiries", icon: "fa-solid fa-circle-info" },
];

type Props = {
  menu: MenuItem[];
  headerTitle?: string;
  headerAction?: React.ReactNode;
  children: (me: User) => React.ReactNode;
};

export default function UserLayout({ menu, headerTitle, headerAction, children }: Props) {
  // 認証チェック: 未ログインなら /login へリダイレクト、ログアウト処理も提供
  const { me, handleLogout } = useRequireAuth();

  // ログイン状態が確定するまで何も描画しない
  if (!me) return null;

  return (
    <div className="user-shell">
      {/* 左サイドバー: メニュー一覧・ユーザー情報・ログアウトボタン */}
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

        {/* メニュー一覧: NavLink の isActive で現在ページをハイライト */}
        <nav className="sidebar-menu">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`nav-icon ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ログアウトボタン: サイドバー最下部に固定 */}
        <button className="btn btn-light w-100 mt-auto" onClick={handleLogout}>
          ログアウト
        </button>
      </aside>

      <main className="flex-grow-1 bg-light">
        {/* 上部ヘッダー: ページタイトルとアバター */}
        <UserHeader title={headerTitle} action={headerAction} />
        {/* render-prop で me を渡し、各ページのコンテンツを描画する */}
        <div className="p-4">{children(me)}</div>
      </main>
    </div>
  );
}
