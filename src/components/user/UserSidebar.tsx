import { NavLink } from "react-router-dom";
import type { User } from "../../lib/userTypes";
import type { MenuItem } from "../../lib/userMenus";
import "../../styles/components/userLayout.css";
import "../../styles/components/userAvatar.css";

type Props = {
  me?: User;
  items: MenuItem[];
  onLogout: () => void;
};

export default function UserSidebar({ me, items, onLogout }: Props) {
  return (
    <aside className="user-sidebar">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="user-avatar user-avatar--sm" />
        <div className="fw-bold">TecPutt</div>
      </div>

      {me && (
        <div className="mb-3">
          <NavLink to={`/users/${me.id}`} className="text-white text-decoration-none small">
            {me.name}
          </NavLink>
          <hr className="border-secondary mt-2 mb-0" />
        </div>
      )}

      <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

      <nav className="d-grid gap-1">
        {items.map((item) => (
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

      <button className="btn btn-light w-100 mt-auto" onClick={onLogout}>
        ログアウト
      </button>
    </aside>
  );
}
