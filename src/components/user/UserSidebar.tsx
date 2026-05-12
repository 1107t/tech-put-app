// src/components/user/UserSidebar.tsx【新規作成】
// 左サイドバーコンポーネント。ユーザー名・メニュー一覧・ログアウトボタンを表示する。
// メニュー項目は props で受け取るため、ページごとに異なるメニューを渡せる。
import { NavLink } from "react-router-dom";
import type { User } from "../../lib/users";
import type { MenuItem } from "../../lib/userMenus";
import "../../styles/components/userLayout.css";
import "../../styles/components/userAvatar.css";

type Props = {
  me?: User;           // ログイン中のユーザー情報（名前・IDの表示に使用）
  items: MenuItem[];   // サイドバーに表示するメニュー項目の配列
  onLogout: () => void; // ログアウトボタン押下時のコールバック
};

export default function UserSidebar({ me, items, onLogout }: Props) {
  return (
    <aside className="user-sidebar">
      {/* ロゴエリア: アバターアイコンとサービス名 */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="user-avatar user-avatar--sm" />
        <div className="fw-bold">TecPutt</div>
      </div>

      {/* ユーザー名: プロフィールページへのリンク */}
      {me && (
        <div className="mb-3">
          <NavLink to={`/users/${me.id}`} className="text-white text-decoration-none small">
            {me.name}
          </NavLink>
          <hr className="border-secondary mt-2 mb-0" />
        </div>
      )}

      {/* セクションラベル */}
      <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

      {/* メニュー一覧: NavLink の isActive を使い、現在ページのボタンをハイライト表示 */}
      <nav className="d-grid gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              // 現在のページなら背景を少し明るくしてハイライト、それ以外は通常のダークボタン
              `btn btn-sm text-start ${isActive ? "btn-secondary" : "btn-dark"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ログアウトボタン: サイドバー最下部に固定 */}
      <button className="btn btn-light w-100 mt-auto" onClick={onLogout}>
        ログアウト
      </button>
    </aside>
  );
}
