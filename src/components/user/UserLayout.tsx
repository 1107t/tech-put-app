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
      </main>
    </div>
  );
}
