// src/pages/admins/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import { getUsers } from "../../lib/adminApi";
import type { AdminUser } from "../../lib/userTypes";
import AdminLayout from "../../components/admin/AdminLayout";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

export default function AdminUsersPage() {
  const { admin, loading, handleLogout } = useRequireAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersReady, setUsersReady] = useState(false);

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    getUsers().then((allUsers) => {
      if (!cancelled) { setUsers(allUsers); setUsersReady(true); }
    });
    return () => { cancelled = true; };
  }, [admin]);

  if (loading || !usersReady) {
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
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
