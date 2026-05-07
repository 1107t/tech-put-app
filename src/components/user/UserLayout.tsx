import type { User } from "../../lib/users";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import "../../styles/components/userLayout.css";

type Props = {
  me: User;
  headerTitle?: string;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function UserLayout({ me, headerTitle, onLogout, children }: Props) {
  return (
    <div className="user-shell">
      <UserSidebar me={me} onLogout={onLogout} />
      <main className="flex-grow-1 bg-light">
        <UserHeader title={headerTitle} />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
