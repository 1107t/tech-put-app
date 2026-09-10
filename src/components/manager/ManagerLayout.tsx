// src/components/manager/ManagerLayout.tsx
// サイドバーは ManagerSidebar コンポーネントに切り出し済み。AdminLayout と同じ見た目・CSSを再利用する。
import { useState } from "react";
import { type Manager } from "../../lib/managerApi";
import ManagerSidebar from "./ManagerSidebar";
import HeaderItem from "./HeaderItem";
import "../../styles/components/adminLayout.css";

type Props = {
  manager: Manager | null;
  onLogout: () => void;
  children: React.ReactNode;
  headerTitle?: string;
  headerAction?: React.ReactNode;
};

export default function ManagerLayout({ manager, onLogout, children, headerTitle, headerAction }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-vh-100 admin-shell">
      <div className="d-flex">
        {/* 左サイドバー（専用コンポーネント） */}
        <ManagerSidebar isOpen={sidebarOpen} />

        {/* メインコンテンツ */}
        <div className={`flex-grow-1 admin-main${sidebarOpen ? "" : " admin-main--expanded"}`}>
          {/* ヘッダー */}
          <HeaderItem
            manager={manager}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            onLogout={onLogout}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            title={headerTitle}
            action={headerAction}
          />

          {/* 各ページ固有のコンテンツ */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
