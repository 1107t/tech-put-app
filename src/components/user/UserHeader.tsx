// src/components/user/UserHeader.tsx【修正】
// ページ上部のヘッダーコンポーネント。ページタイトルとアバターアイコンを表示する。
// UserLayout から呼び出され、headerTitle props でタイトルを受け取る。
import type { ReactNode } from "react";
import UserAvatar from "./UserAvatar";
import "../../styles/components/userLayout.css";

type Props = {
  title?: string;
  action?: ReactNode;
};

export default function UserHeader({ title, action }: Props) {
  return (
    <div className="user-header">
      <span className="header-title">≡ {title}</span>
      <div className="d-flex align-items-center gap-3">
        {action}
        <UserAvatar size="sm" />
      </div>
    </div>
  );
}
