// src/pages/managers/ManagerDashboardPage.tsx
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";

export default function ManagerDashboardPage() {
  const { manager, loading, error, handleLogout } = useRequireManager();

  if (error) {
    return <PageError message={error} />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <ManagerLayout manager={manager} onLogout={handleLogout}>
      <h4>ダッシュボード</h4>
      <p>ログイン成功！ダッシュボードです。</p>
    </ManagerLayout>
  );
}
