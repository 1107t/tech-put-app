// src/pages/admins/AdminDashboardPage.tsx
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboardPage() {
  const { admin, loading, error, handleLogout } = useRequireAdmin();

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
        <p className="text-danger mb-0">{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>再試行</button>
      </div>
    );
  }

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
