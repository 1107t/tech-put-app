// src/components/user/UserHeader.tsx【新規作成】
// ページ上部のヘッダーコンポーネント。ページタイトルとアバターアイコンを表示する。
// UserLayout から呼び出され、headerTitle props でタイトルを受け取る。
import UserAvatar from "./UserAvatar";
import "../../styles/components/userLayout.css";

type Props = {
  title?: string; // ヘッダーに表示するページタイトル（省略可）
};

export default function UserHeader({ title }: Props) {
  return (
    <div className="user-header">
      {/* ページタイトル: ハンバーガーアイコン風の「≡」と組み合わせて表示 */}
      <span>≡ {title}</span>
      {/* 右端にアバターアイコンを表示 */}
      <UserAvatar size="sm" />
    </div>
  );
}
