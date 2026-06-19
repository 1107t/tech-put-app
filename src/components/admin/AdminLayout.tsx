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
};

export default function AdminLayout({ admin, onLogout, children }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-vh-100 admin-shell">
      <div className="d-flex">
        {/* 左サイドバー（専用コンポーネント） */}
        <AdminSidebar />

        {/* メインコンテンツ */}
        <div className="flex-grow-1 admin-main">
          {/* ヘッダー */}
          <HeaderItem
            admin={admin}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            onLogout={onLogout}
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
