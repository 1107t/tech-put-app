import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import {
  GridIcon,
  ListIcon,
  UserIcon,
  PlusSquareIcon,
  AvatarIcon
} from "../../components/Icons"; //
import UserProfilePage from "../users/UserProfilePage";

export default function UserHomePage() {
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return nav("/login", { replace: true });
      setMe(u);
    })();
  }, [nav]);


  const goDashboard = () => {
    nav("/dashboard", { replace: true });
  };

  const goMyPage = () => {
    nav("/mypage");
  };

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <div className="d-flex user-dashboard">
      <aside className="user-dashboard__sidebar">
        <div className="fw-bold mb-3">
          <button className="dropdown-item" onClick={goDashboard}>
            TechPutt
          </button>
        </div>

        <div className="user-dashboard__profile">
          <Link to={`/users/${me.id}`} className="user-dashboard__profile-link">
            {me.name}
          </Link>
          <div className="user-dashboard__divider" />
        </div>

        <div className="user-dashboard__nav">
          <Link className="user-dashboard__nav-item" to="/memos">
            <GridIcon className="user-dashboard__nav-icon" size={18} />
            <span>メモ一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles">
            <ListIcon className="user-dashboard__nav-icon" size={18} />
            <span>プロフィール一覧</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/profiles/new">
            <UserIcon className="user-dashboard__nav-icon" size={18} />
            <span>プロフィール作成</span>
          </Link>

          <Link className="user-dashboard__nav-item" to="/memos/new">
            <PlusSquareIcon className="user-dashboard__nav-icon" size={18} />
            <span>メモ作成</span>
          </Link>
        </div>

      </aside>
      <main className="flex-grow-1 bg-light">
        <div className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
          <h1 className="h5 mb-0">投稿した記事一覧</h1>

          <div className="position-relative">
            <button
              className="btn p-0 border-0 bg-transparent"
              onClick={() => setOpen(!open)}
            >
              <AvatarIcon size={42}  />
            </button>

            {open && (
              <div className="dropdown-menu show position-absolute end-0 mt-2">
                <button className="dropdown-item" onClick={goMyPage}>
                  マイページ
                </button>
                <button className="dropdown-item" onClick={goDashboard}>
                  ダッシュボード
                </button>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-center mt-5">
            <div className="card shadow-sm" style={{ width: "420px" }}>
              <div className="card-body text-center">

                <h3 className="mb-4">ユーザー詳細画面</h3>

                <AvatarIcon size={90} />

                <div className="mt-3 fw-bold">
                  <UserIcon size={16} className="me-2" />
                  {me.name}
                </div>

              <div className="d-flex justify-content-center gap-4 mt-3">
                <div>
                  <div>0</div>
                  <small className="text-muted">フォロー</small>
                </div>
                <div>
                  <div>0</div>
                  <small className="text-muted">フォロワー</small>
                </div>
              </div>

              <hr />

              <div className="text-start mt-3">
                <p>
                  📧 {me.email}
                </p>
                <p>
                  🎂 {me.birthday}
                </p>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-success btn-sm">
                  投稿記事
                </button>
                <button className="btn btn-danger btn-sm">
                  投稿動画
                </button>
                <button className="btn btn-info btn-sm text-white">
                  投稿つぶやき
                </button>
              </div>

            </div>
          </div>
          </div>
      </main>
    </div>
  );
}
