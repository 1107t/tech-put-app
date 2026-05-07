import { Link } from "react-router-dom";
import type { User } from "../../lib/users";
import "../../styles/components/userLayout.css";
import "../../styles/components/userAvatar.css";

type Props = {
  me?: User;
  onLogout: () => void;
};

const menuItems = [
  { id: 1, label: "記事一覧", to: "/dashboard" },
  { id: 2, label: "プロフィール一覧", to: "/profiles" },
  { id: 3, label: "動画投稿一覧", to: "/videos" },
  { id: 4, label: "つぶやき一覧", to: "/tweets" },
  { id: 5, label: "問い合わせ", to: "/inquiries" },
];

export default function UserSidebar({ me, onLogout }: Props) {
  return (
    <aside className="user-sidebar">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="user-avatar user-avatar--sm" />
        <div className="fw-bold">TecPutt</div>
      </div>

      {me && (
        <div className="mb-3">
          <Link to={`/users/${me.id}`} className="text-white text-decoration-none small">
            {me.name}
          </Link>
          <hr className="border-secondary mt-2 mb-0" />
        </div>
      )}

      <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

      <nav className="d-grid gap-1">
        {menuItems.map((item) => (
          <Link key={item.id} className="btn btn-sm btn-dark text-start" to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button className="btn btn-light w-100 mt-auto" onClick={onLogout}>
        ログアウト
      </button>
    </aside>
  );
}
