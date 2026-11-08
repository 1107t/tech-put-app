// src/pages/managers/TenantEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTenant, updateTenant } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import TenantForm, { type TenantFormValues } from "../../components/manager/TenantForm";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";
import "../../styles/components/form.css";

export default function TenantEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { manager, loading, error: networkError, handleLogout } = useRequireManager();

  const [currentName, setCurrentName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    if (!manager || !id) return;
    let cancelled = false;
    setTenantLoading(true);
    setTenantError(null);
    getTenant(id)
      .then((tenant) => { if (!cancelled) setCurrentName(tenant.name); })
      .catch((err) => { if (!cancelled) setTenantError(getApiErrorMessage(err, "テナント情報の取得に失敗しました。")); })
      .finally(() => { if (!cancelled) setTenantLoading(false); });
    return () => { cancelled = true; };
  }, [manager, id]);

  const handleSubmit = async ({ name }: TenantFormValues) => {
    if (isSubmitting || !id) return;
    if (!name.trim()) { setError("テナント名を入力してください。"); return; }
    setIsSubmitting(true);
    try {
      await updateTenant(id, name.trim());
      navigate(`/manager/tenants/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "テナント名の更新に失敗しました。"));
      setIsSubmitting(false);
    }
  };

  if (networkError) {
    return <PageError message={networkError} />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <ManagerLayout manager={manager} onLogout={handleLogout} headerTitle="テナント編集">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4 form-header">
                <h5 className="mb-0">テナント編集</h5>
              </div>

              {tenantError && <p className="text-danger">{tenantError}</p>}

              {!tenantError && tenantLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">読み込み中...</span>
                  </div>
                </div>
              )}

              {!tenantError && !tenantLoading && (
                <TenantForm
                  mode="edit"
                  initialName={currentName}
                  error={error}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate(`/manager/tenants/${id}`)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
