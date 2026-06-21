// src/pages/admins/AdminDashboardPage.tsx
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboardPage() {
  const { admin, loading, handleLogout } = useRequireAdmin();

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
      <h4>ダッシュボード</h4>
      <p>ログイン成功！ダッシュボードです。</p>
    </AdminLayout>
  );
}
