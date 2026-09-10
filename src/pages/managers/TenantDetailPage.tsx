// src/pages/managers/TenantDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTenant, type Tenant } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";

export default function TenantDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { manager, loading: managerLoading, error: managerError, handleLogout } = useRequireManager();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    if (!manager || !id) return;
    let cancelled = false;
    setTenantLoading(true);
    setTenantError(null);
    getTenant(id)
      .then((data) => { if (!cancelled) setTenant(data); })
      .catch((err) => { if (!cancelled) setTenantError(getApiErrorMessage(err, "テナント情報の取得に失敗しました。")); })
      .finally(() => { if (!cancelled) setTenantLoading(false); });
    return () => { cancelled = true; };
  }, [manager, id]);

  if (managerError) {
    return <PageError message={managerError} />;
  }

  if (managerLoading) {
    return <PageSpinner />;
  }

  return (
    <ManagerLayout manager={manager} onLogout={handleLogout} headerTitle="テナント詳細">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">テナント詳細</h5>
              </div>

              {tenantError && <PageError message={tenantError} onRetry={() => window.location.reload()} />}

              {!tenantError && tenantLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">読み込み中...</span>
                  </div>
                </div>
              )}

              {!tenantError && !tenantLoading && tenant && (
                <>
                  <dl className="row mb-4">
                    <dt className="col-4 text-muted" style={{ fontSize: "14px" }}>テナント名</dt>
                    <dd className="col-8">{tenant.name}</dd>
                    <dt className="col-4 text-muted" style={{ fontSize: "14px" }}>テナントID</dt>
                    <dd className="col-8">{tenant.id}</dd>
                    <dt className="col-4 text-muted" style={{ fontSize: "14px" }}>登録日</dt>
                    <dd className="col-8">{new Date(tenant.createdAt).toLocaleDateString("ja-JP")}</dd>
                  </dl>

                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate("/manager/dashboard")}
                    >
                      ダッシュボードへ戻る
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
