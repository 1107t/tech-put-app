import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../lib/users";
import "../../styles/pages/dashboard.css";

import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
} from "../../components/Icons";


type Props = {
  me: User;
  onLogout: () => void;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function UserLayout({ sidebar, children }: Props) {
  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        {sidebar}
      </aside>

      <main className="flex-grow-1 bg-light">
        {children}
      </main>
    </div>
  );
}
