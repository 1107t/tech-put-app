// src/components/user/UserLayout.tsx【新規作成】
// サイドバー・ヘッダー・メインコンテンツを組み合わせたページ共通レイアウト。
// 認証チェック（useRequireAuth）を内部で行い、未ログインなら /login にリダイレクトする。
import type { MenuItem } from "../../lib/userMenus";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";

type Props = {
  menu: MenuItem[];       // サイドバーに表示するメニュー項目
  headerTitle?: string;   // ヘッダーに表示するページタイトル
  children: React.ReactNode; // 各ページのメインコンテンツ
};

export default function UserLayout({ menu, headerTitle, children }: Props) {
  // 認証チェック: 未ログインなら /login へリダイレクト、ログアウト処理も提供
  const { me, handleLogout } = useRequireAuth();

  // ログイン状態が確定するまで何も描画しない
  if (!me) return null;

  return (
    <div className="user-shell">
      {/* 左サイドバー: メニュー一覧・ユーザー情報・ログアウトボタン */}
      <UserSidebar me={me} items={menu} onLogout={handleLogout} />
      <main className="flex-grow-1 bg-light">
        {/* 上部ヘッダー: ページタイトルとアバター */}
        <UserHeader title={headerTitle} />
        {/* 各ページのコンテンツをここに描画 */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
