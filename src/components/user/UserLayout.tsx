// src/components/user/UserLayout.tsx【修正】
// サイドバー・ヘッダー・メインコンテンツを組み合わせたページ共通レイアウト。
// render-prop パターンで me を子に渡すため、子側で useRequireAuth を二重呼び出しする必要がない。
// headerAction を受け取り UserHeader に転送することで、ページ固有のボタンをヘッダーに表示できる。
import React from "react";
import type { MenuItem } from "../../lib/userMenus";
import type { User } from "../../lib/users";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";

type Props = {
  menu: MenuItem[];                        // サイドバーに表示するメニュー項目
  headerTitle?: string;                    // ヘッダーに表示するページタイトル
  headerAction?: React.ReactNode;          // ヘッダーに表示するページ固有のアクションボタン（省略可）
  children: (me: User) => React.ReactNode; // render-prop: ログイン中ユーザーを受け取りコンテンツを返す
};

export default function UserLayout({ menu, headerTitle, headerAction, children }: Props) {
  // 認証チェック: 未ログインなら /login へリダイレクト、ログアウト処理も提供
  const { me, handleLogout } = useRequireAuth();

  // ログイン状態が確定するまで何も描画しない
  if (!me) return null;

  return (
    <div className="user-shell">
      {/* 左サイドバー: メニュー一覧・ユーザー情報・ログアウトボタン */}
      <UserSidebar me={me} items={menu} onLogout={handleLogout} />
      <main className="flex-grow-1 bg-light">
        {/* 上部ヘッダー: ページタイトル・アクションボタン・アバター */}
        <UserHeader title={headerTitle} action={headerAction} />
        {/* render-prop で me を渡し、各ページのコンテンツを描画する */}
        <div className="p-4">{children(me)}</div>
      </main>
    </div>
  );
}
