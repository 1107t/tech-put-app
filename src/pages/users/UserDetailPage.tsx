// src/pages/users/UserDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";
import UserLayout from "../../components/user/UserLayout";
import { AvatarIcon, UserIcon } from "../../components/Icons";

export default function UserDetailPage() {
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) return nav("/login", { replace: true });
      setMe(u);
    })();
  }, [nav]);

  const goDashboard = () => {
    nav("/dashboard");
  };

  const goMyPage = () => {
    nav(`/users/${me?.id}`);
  };

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  if (!me) return null;

  return (
    <UserLayout
      me={me}
      variant="user"
      onMyPage={goMyPage}
      onDashboard={goDashboard}
      onLogout={handleLogout}
      title="ユーザー詳細"
    >
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
              <p>📧 {me.email}</p>
              <p>🎂 {me.birthday}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
