// src/components/user/UserSidebarItem.tsx
// サイドバーのメニュー1項目（AdminLTE 風のフラットな nav-link）。
import { NavLink } from "react-router-dom";
import { useTenantPath } from "../../lib/useTenantPath";

type Props = {
  label: string;
  to: string; // /tenant/:tenantId/users を除いた相対パス（例: "/dashboard"）
  icon: string; // Font Awesome のアイコンクラス
};

export default function UserSidebarItem({ label, to, icon }: Props) {
  const path = useTenantPath();
  return (
    <NavLink
      to={path(to)}
      end={to === "/dashboard"}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      <i className={`nav-icon ${icon}`} />
      <span>{label}</span>
    </NavLink>
  );
}
