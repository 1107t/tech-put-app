// src/pages/managers/TenantNewPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";
import { useRequireManager } from "../../lib/useRequireManager";
import ManagerLayout from "../../components/manager/ManagerLayout";
import PageSpinner from "../../components/admin/PageSpinner";
import PageError from "../../components/admin/PageError";

const NAME_MAX = 20;
// Devise の validatable と同じ最小文字数
const PASSWORD_MIN = 6;

export default function TenantNewPage() {
  const navigate = useNavigate();
  const { manager, loading, error: networkError, handleLogout } = useRequireManager();

  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name.trim()) { setError("テナント名を入力してください。"); return; }
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setError("管理者の名前・メールアドレス・パスワードを入力してください。");
      return;
    }
    if (adminPassword.length < PASSWORD_MIN) {
      setError(`パスワードは${PASSWORD_MIN}文字以上で入力してください。`);
      return;
    }
    if (adminPassword !== adminPasswordConfirmation) {
      setError("パスワード確認が一致しません。");
      return;
    }
    setIsSubmitting(true);
    try {
      const tenant = await createTenant({
        name: name.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
        adminPasswordConfirmation,
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
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">テナント追加</h5>
              </div>

              {error && <p className="text-danger">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="mb-1">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    テナント名
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    maxLength={NAME_MAX}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`テナント名 (必須 ${NAME_MAX}文字まで)`}
                  />
                </div>
                <div className="mb-4 text-end">
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    {name.length}文字
                  </span>
                </div>

                <h6 className="mb-3">テナント管理者アカウント</h6>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    管理者名
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="管理者名 (必須)"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="メールアドレス (必須)"
                    autoComplete="off"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    パスワード
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={`パスワード (必須 ${PASSWORD_MIN}文字以上)`}
                    autoComplete="new-password"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: "14px" }}>
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={adminPasswordConfirmation}
                    onChange={(e) => setAdminPasswordConfirmation(e.target.value)}
                    placeholder="パスワード（確認）"
                    autoComplete="new-password"
                  />
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? "登録中..." : "登録"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/manager/dashboard")}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
