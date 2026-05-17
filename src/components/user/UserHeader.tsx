// src/components/user/UserHeader.tsx【修正】
// ページ上部のヘッダーコンポーネント。ページタイトル・アバターアイコン・アクションボタンを表示する。
// UserLayout から呼び出され、headerTitle と headerAction props を受け取る。
import React from "react";
import UserAvatar from "./UserAvatar";
import "../../styles/components/userLayout.css";

type Props = {
  title?: string;           // ヘッダーに表示するページタイトル（省略可）
  action?: React.ReactNode; // タイトル右隣に表示するアクションボタン（省略可）
};

export default function UserHeader({ title, action }: Props) {
  return (
    <div className="user-header">
      {/* 左側: タイトルとページ固有のアクションボタン */}
      <div className="d-flex align-items-center gap-3">
        <span>≡ {title}</span>
        {/* action が渡されている場合のみ表示（例: つぶやき投稿ボタン） */}
        {action && <div>{action}</div>}
      </div>
      {/* 右端にアバターアイコンを表示 */}
      <UserAvatar size="sm" />
    </div>
  );
}
