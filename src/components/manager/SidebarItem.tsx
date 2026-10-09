// src/components/manager/SidebarItem.tsx
import { NavLink } from "react-router-dom";

type Props = {
  label: string;
  to: string;
  icon: string; // Font Awesome のアイコンクラス（Rails の nav-icon に合わせる）
};

export default function SidebarItem({ label, to, icon }: Props) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === "/manager/dashboard"}
        className={({ isActive }) => `admin-sidebar-link ${isActive ? "active" : ""}`}
      >
        <i className={`nav-icon ${icon}`} />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}
