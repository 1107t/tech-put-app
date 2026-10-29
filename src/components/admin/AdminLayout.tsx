// src/components/admin/AdminLayout.tsx
// サイドバーは AdminSidebar コンポーネントに切り出し済み。
import { useState } from "react";
import { type Admin } from "../../lib/adminApi";
import AdminSidebar from "./AdminSidebar";
import HeaderItem from "./HeaderItem";
import "../../styles/components/adminLayout.css";

type Props = {
  admin: Admin | null;
  onLogout: () => void;
  children: React.ReactNode;
  headerTitle?: string;
  headerAction?: React.ReactNode;
  headerBreadcrumb?: { label: string; to: string };
};

export default function AdminLayout({ admin, onLogout, children, headerTitle, headerAction, headerBreadcrumb }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-vh-100 admin-shell">
      <div className="d-flex">
        {/* 左サイドバー（専用コンポーネント） */}
        <AdminSidebar isOpen={sidebarOpen} />

        {/* メインコンテンツ */}
        <div className={`flex-grow-1 admin-main${sidebarOpen ? "" : " admin-main--expanded"}`}>
          {/* ヘッダー */}
          <HeaderItem
            admin={admin}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            onLogout={onLogout}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            title={headerTitle}
            action={headerAction}
            breadcrumb={headerBreadcrumb}
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
