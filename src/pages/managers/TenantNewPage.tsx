// src/pages/managers/TenantNewPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import TenantForm, { PASSWORD_MIN, type TenantFormValues } from "../../components/manager/TenantForm";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";
import "../../styles/components/form.css";

export default function TenantNewPage() {
  const navigate = useNavigate();
  const { manager, loading, error: networkError, handleLogout } = useRequireManager();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: TenantFormValues) => {
    if (isSubmitting) return;
    if (!values.name.trim()) { setError("テナント名を入力してください。"); return; }
    if (!values.adminName.trim() || !values.adminEmail.trim() || !values.adminPassword) {
      setError("管理者の名前・メールアドレス・パスワードを入力してください。");
      return;
    }
    if (values.adminPassword.length < PASSWORD_MIN) {
      setError(`パスワードは${PASSWORD_MIN}文字以上で入力してください。`);
      return;
    }
    if (values.adminPassword !== values.adminPasswordConfirmation) {
      setError("パスワード確認が一致しません。");
      return;
    }
    setIsSubmitting(true);
    try {
      const tenant = await createTenant({
        name: values.name.trim(),
        adminName: values.adminName.trim(),
        adminEmail: values.adminEmail.trim(),
        adminPassword: values.adminPassword,
        adminPasswordConfirmation: values.adminPasswordConfirmation,
      });
      navigate(`/manager/tenants/${tenant.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "テナントの登録に失敗しました。"));
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
    <ManagerLayout manager={manager} onLogout={handleLogout} headerTitle="テナント追加">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center pb-3 mb-4 form-header">
                <h5 className="mb-0">テナント追加</h5>
              </div>

              <TenantForm
                mode="new"
                error={error}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/manager/dashboard")}
              />
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
