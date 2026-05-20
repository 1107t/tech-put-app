import UserAvatar from "./UserAvatar";
import "../../styles/components/userLayout.css";

type Props = {
  title?: string;
};

export default function UserHeader({ title }: Props) {
  return (
    <div className="user-header">
      <span>≡ {title}</span>
      <UserAvatar size="sm" />
    </div>
  );
}
