// src/components/admin/SidebarItem.tsx 【修正】
// 管理画面サイドバーの各メニュー項目コンポーネント。
// ホバー時に背景色を変えてインタラクティブ感を演出する。
import { Link } from "react-router-dom";

type Props = {
  label: string;
  to: string;
};

export default function SidebarItem({ label, to }: Props) {
  return (
    <li className="mb-1">
      {/* ホバー時のみ背景色を暗くし、ホバー解除で透明に戻す */}
      <Link
        to={to}
        className="text-white text-decoration-none d-flex align-items-center py-2 px-3 rounded"
        style={{ fontSize: "14px" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span className="me-2" style={{ fontSize: "10px" }}>■</span>
        {label}
      </Link>
    </li>
  );
}