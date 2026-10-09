// src/pages/managers/ManagerDashboardPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTenants, type Tenant } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";

export default function ManagerDashboardPage() {
  const { manager, loading: managerLoading, error: managerError, handleLogout } = useRequireManager();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState<string | null>(null);

  useEffect(() => {
    if (!manager) return;
    let cancelled = false;
    setTenantsLoading(true);
    setTenantsError(null);
    getTenants()
      .then((data) => { if (!cancelled) setTenants(data); })
      .catch((err) => { if (!cancelled) setTenantsError(getApiErrorMessage(err, "テナント一覧の取得に失敗しました。")); })
      .finally(() => { if (!cancelled) setTenantsLoading(false); });
    return () => { cancelled = true; };
  }, [manager]);

  if (managerError) {
    return <PageError message={managerError} />;
  }

  if (managerLoading) {
    return <PageSpinner />;
  }

  return (
    <ManagerLayout
      manager={manager}
      onLogout={handleLogout}
      headerAction={
        <Link to="/manager/tenants/new" className="btn btn-success btn-sm d-flex align-items-center gap-1">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
          テナント追加
        </Link>
      }
    >
      <h4 className="mb-4">ダッシュボード</h4>

      {tenantsError && <p className="text-danger">{tenantsError}</p>}

      {!tenantsError && tenantsLoading && (
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">読み込み中...</span>
          </div>
        </div>
      )}

      {!tenantsError && !tenantsLoading && (
        <div className="card shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>テナント名</th>
                <th>登録日</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    登録されているテナントがありません
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>{new Date(tenant.createdAt).toLocaleDateString("ja-JP")}</td>
                    <td className="text-end">
                      <Link to={`/manager/tenants/${tenant.id}`} className="btn btn-secondary btn-sm">
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </ManagerLayout>
  );
}
