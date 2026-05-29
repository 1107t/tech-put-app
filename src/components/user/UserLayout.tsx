// src/components/user/UserLayout.tsx【修正】
// サイドバー・ヘッダー・メインコンテンツを組み合わせたページ共通レイアウト。
// render-prop パターンで me を子に渡すため、子側で useRequireAuth を二重呼び出しする必要がない。
import { NavLink } from "react-router-dom";
import type { User } from "../../lib/users";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";
import "../../styles/components/userAvatar.css";

// サイドバーメニュー項目の型定義
export type MenuItem = {
  label: string; // 表示テキスト
  to: string;    // リンク先のパス
};

// 受講生ダッシュボード共通メニュー（全ページで共有）
export const dashboardMenu: MenuItem[] = [
  { label: "記事一覧", to: "/articles" },
  { label: "プロフィール一覧", to: "/profiles" },
  { label: "動画投稿一覧", to: "/videos" },
  { label: "つぶやき一覧", to: "/tweets" },
  { label: "問い合わせ", to: "/inquiries" },
];

type Props = {
  menu: MenuItem[];                        // サイドバーに表示するメニュー項目
  headerTitle?: string;                    // ヘッダーに表示するページタイトル
  children: (me: User) => React.ReactNode; // render-prop: ログイン中ユーザーを受け取りコンテンツを返す
};

export default function UserLayout({ menu, headerTitle, children }: Props) {
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
          <NavLink to={`/users/${me.id}`} className="text-white text-decoration-none small">
            {me.name}
          </NavLink>
          <hr className="border-secondary mt-2 mb-0" />
        </div>

        {/* セクションラベル */}
        <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

        {/* メニュー一覧: NavLink の isActive で現在ページをハイライト */}
        <nav className="d-grid gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `btn btn-sm text-start ${isActive ? "btn-secondary" : "btn-dark"}`
              }
            >
              {item.label}
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
        <UserHeader title={headerTitle} />
        {/* render-prop で me を渡し、各ページのコンテンツを描画する */}
        <div className="p-4">{children(me)}</div>
      </main>
    </div>
  );
}
