// src/components/user/UserAvatar.tsx【新規作成】
// アバターアイコンコンポーネント。サイズを props で切り替えられる。
// 画像は未実装のため、CSS で背景色の円として表示している。
import "../../styles/components/userAvatar.css";

type Props = {
  size?: "sm" | "md"; // sm: 28px（ヘッダー用）/ md: 36px（カード用）
};

export default function UserAvatar({ size = "sm" }: Props) {
  // size に応じた CSS クラスを付与して円形アバターを描画
  return <div className={`user-avatar user-avatar--${size}`} />;
}
