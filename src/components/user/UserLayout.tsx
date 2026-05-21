<<<<<<< HEAD
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../lib/users";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import "../../styles/pages/dashboard.css";

import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
} from "../../components/Icons";


type Props = {
  me: User;
  children: ReactNode;
  variant?: "dashboard" | "user";
  onMyPage: () => void;
  onDashboard: () => void;
  onLogout: () => void;
  title?: string;
};

export default function UserLayout({
  me,
  children,
  variant,
  onMyPage,
  onDashboard,
  onLogout,
  title,
}: Props) {
  return (
    <div className="d-flex user-dashboard">
      <Sidebar me={me} variant={variant} />

      <main className="flex-grow-1 bg-light">
        <HeaderBar
          title={title}
          onMyPage={onMyPage}
          onDashboard={onDashboard}
          onLogout={onLogout}
        />

        {children}
=======
import type { MenuItem } from "../../lib/userMenus";
import { useRequireAuth } from "../../lib/useRequireAuth";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";

type Props = {
  menu: MenuItem[];
  headerTitle?: string;
  children: React.ReactNode;
};

export default function UserLayout({ menu, headerTitle, children }: Props) {
  const { me, handleLogout } = useRequireAuth();

  if (!me) return null;

  return (
    <div className="user-shell">
      <UserSidebar me={me} items={menu} onLogout={handleLogout} />
      <main className="flex-grow-1 bg-light">
        <UserHeader title={headerTitle} />
        <div className="p-4">{children}</div>
>>>>>>> 2b73daa9406bf5a7668212a6da024ba1aaf99b4d
      </main>
    </div>
  );
}
