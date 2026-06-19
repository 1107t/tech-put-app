// src/components/user/UserSidebarItem.tsx
// サイドバーのメニュー1項目（AdminLTE 風のフラットな nav-link）。
import { NavLink } from "react-router-dom";

type Props = {
  label: string;
  to: string;
  icon: string; // Font Awesome のアイコンクラス
};

export default function UserSidebarItem({ label, to, icon }: Props) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      <i className={`nav-icon ${icon}`} />
      <span>{label}</span>
    </NavLink>
  );
}
