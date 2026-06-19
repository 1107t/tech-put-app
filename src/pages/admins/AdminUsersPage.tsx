// src/pages/admins/AdminUsersPage.tsx【修正】
// 登録ユーザー一覧ページ。管理者ログイン確認後、ユーザー一覧とつぶやき投稿数を表示する。
// adminApi.getUsers() が返す AdminUser 型に tweetsCount が含まれるため tweetsStore は不要。
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getUsers, type Admin } from "../../lib/adminApi";
import type { AdminUser } from "../../lib/userTypes";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 管理者ログイン確認。未ログインならログインページへリダイレクトする
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);

      // Rails API からユーザー一覧を取得する（AdminUser 型に tweetsCount が含まれる）
      const allUsers = await getUsers();
      if (!cancelled) {
        setUsers(allUsers);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">登録ユーザー一覧</h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>名前</th>
              <th>email</th>
              <th>記事投稿数</th>
              <th>動画投稿数</th>
              {/* つぶやき投稿数列を追加 */}
              <th>つぶやき投稿数</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                {/* colSpan をつぶやき投稿数列の追加に合わせて6に更新 */}
                <td colSpan={6} className="text-center text-muted py-4">
                  登録されているユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="text-muted">{user.articlesCount}</td>
                  <td className="text-muted">{user.postsCount}</td>
                  <td>
                    {/* クリックでユーザー別つぶやき一覧ページへ遷移する */}
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(`/admin/users/${user.id}/tweets`)}
                    >
                      {user.tweetsCount}
                    </button>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-link text-secondary p-0">
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
