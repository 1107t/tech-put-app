import "../../styles/components/userAvatar.css";

type Props = {
  size?: "sm" | "md";
};

export default function UserAvatar({ size = "sm" }: Props) {
  return <div className={`user-avatar user-avatar--${size}`} />;
}
