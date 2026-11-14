// src/components/user/UserHeader.tsx【修正】
// ページ上部のヘッダーコンポーネント。ページタイトルとアバターアイコンを表示する。
// UserLayout から呼び出され、headerTitle props でタイトルを受け取る。
import type { ReactNode } from "react";
import UserAvatar from "./UserAvatar";
import "../../styles/components/userLayout.css";

type Props = {
  title?: string;
  action?: ReactNode;
  onMenuOpen: () => void;
};

export default function UserHeader({ title, action, onMenuOpen }: Props) {
  return (
    <div className="user-header">
      <span className="header-title">
        <button type="button" className="user-menu-button d-md-none" aria-label="メニューを開く" onClick={onMenuOpen}>
          ≡
        </button>
        <span className="d-none d-md-inline">≡ </span>
        {title}
      </span>
      <div className="d-flex align-items-center gap-3">
        {action}
        <UserAvatar size="sm" />
      </div>
    </div>
  );
}
