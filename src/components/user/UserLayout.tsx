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
      </main>
    </div>
  );
}
