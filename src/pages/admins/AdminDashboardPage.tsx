// src/pages/admins/AdminDashboardPage.tsx
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";

export default function AdminDashboardPage() {
  const { admin, loading, error, handleLogout } = useRequireAdmin();

  if (error) {
    return <PageError message={error} />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <h4>ダッシュボード</h4>
      <p>ログイン成功！ダッシュボードです。</p>
    </AdminLayout>
  );
}
