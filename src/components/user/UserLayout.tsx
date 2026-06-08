// src/components/user/UserLayout.tsx
// サイドバー・ヘッダー・メインコンテンツを組み合わせたページ共通レイアウト。
// サイドバーは UserSidebar コンポーネントに切り出し済み。
// render-prop パターンで me を子に渡すため、子側で useRequireAuth を二重呼び出しする必要がない。
import type { User } from "../../lib/userTypes";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserHeader from "./UserHeader";
import UserSidebar, { type MenuItem } from "./UserSidebar";
import "../../styles/components/userLayout.css";

// 既存の import 互換のため UserSidebar の型を再エクスポートする
export type { MenuItem };

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
      {/* 左サイドバー（専用コンポーネント） */}
      <UserSidebar me={me} menu={menu} onLogout={handleLogout} />

      <main className="flex-grow-1 bg-light">
        {/* 上部ヘッダー: ページタイトルとアバター */}
        <UserHeader title={headerTitle} action={headerAction} />
        {/* render-prop で me を渡し、各ページのコンテンツを描画する */}
        <div className="p-4">{children(me)}</div>
      </main>
    </div>
  );
}
