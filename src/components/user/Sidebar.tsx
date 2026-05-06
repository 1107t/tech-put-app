// src/components/Sidebar.tsx
import { Link } from "react-router-dom";
import type { User } from "../../lib/users";
import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
} from "../../components/Icons";

type Props = {
  me: User;
  variant?: "dashboard" | "user";
};

export default function Sidebar({ me, variant = "dashboard" }: Props) {
  return (
    <aside className="user-dashboard__sidebar">

      {/* 共通部分 */}
      <div className="fw-bold mb-3">
        <Link to="/dashboard" className="dropdown-item">
          TechPutt
        </Link>
      </div>

      <div className="user-dashboard__profile">
        <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
          {me.name}
        </Link>
        <div className="user-dashboard__divider" />
      </div>

      {/* 👇 分岐 */}
      {variant === "dashboard" ?  (
          <><div className="small text-uppercase text-white-50 user-dashboard__nav-title">
          e-learning
        </div>
        <div className="user-dashboard__nav">
            <Link className="user-dashboard__nav-item" to="/memos">
              <GridIcon className="user-dashboard__nav-icon" size={18} />
              <span>記事一覧</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/profiles">
              <ListIcon className="user-dashboard__nav-icon" size={18} />
              <span>プロフィール一覧</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/profiles/new">
              <UserIcon className="user-dashboard__nav-icon" size={18} />
              <span>動画投稿一覧</span>
            </Link>
            <Link className="user-dashboard__nav-item" to="/memos/new">
              <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
              <span>つぶやき一覧</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/memos/new">
              <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
              <span>問い合わせ</span>
            </Link>
          </div></>
        ) : (

        <>
          <div className="user-dashboard__nav">
            <Link className="user-dashboard__nav-item" to="/memos">
              <span>メモ一覧</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/profiles">
              <span>プロフィール一覧</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/profiles/new">
              <span>プロフィール作成</span>
            </Link>

            <Link className="user-dashboard__nav-item" to="/memos/new">
              <span>メモ作成</span>
            </Link>
          </div>
        </>
        )}

    </aside>
  );
}
