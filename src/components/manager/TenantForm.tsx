// src/components/manager/TenantForm.tsx
import { useState } from "react";
import "../../styles/components/form.css";

const NAME_MAX = 20;
// Devise の validatable と同じ最小文字数
export const PASSWORD_MIN = 6;

export type TenantFormValues = {
  name: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirmation: string;
};

type TenantFormProps = {
  mode: "new" | "edit";
  initialName?: string;
  error: string;
  isSubmitting: boolean;
  onSubmit: (values: TenantFormValues) => void;
  onCancel: () => void;
};

export default function TenantForm({ mode, initialName = "", error, isSubmitting, onSubmit, onCancel }: TenantFormProps) {
  const [name, setName] = useState(initialName);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState("");

  const submitLabel = mode === "new" ? "登録" : "保存";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, adminName, adminEmail, adminPassword, adminPasswordConfirmation });
  };

  return (
    <>
      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-1">
          <label className="form-label form-label-sm" htmlFor="tenant-name">
            テナント名
          </label>
          <input
            id="tenant-name"
            type="text"
            className="form-control"
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder={`テナント名 (必須 ${NAME_MAX}文字まで)`}
          />
        </div>
        <div className="mb-4 text-end">
          <span className="text-muted form-count">
            {name.length}文字
          </span>
        </div>

        {mode === "new" && (
          <>
            <h6 className="mb-3">テナント管理者アカウント</h6>
            <div className="mb-3">
              <label className="form-label form-label-sm" htmlFor="tenant-admin-name">
                管理者名
              </label>
              <input
                id="tenant-admin-name"
                type="text"
                className="form-control"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="管理者名 (必須)"
              />
            </div>
            <div className="mb-3">
              <label className="form-label form-label-sm" htmlFor="tenant-admin-email">
                メールアドレス
              </label>
              <input
                id="tenant-admin-email"
                type="email"
                className="form-control"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="メールアドレス (必須)"
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label form-label-sm" htmlFor="tenant-admin-password">
                パスワード
              </label>
              <input
                id="tenant-admin-password"
                type="password"
                className="form-control"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={`パスワード (必須 ${PASSWORD_MIN}文字以上)`}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label className="form-label form-label-sm" htmlFor="tenant-admin-password-confirmation">
                パスワード（確認）
              </label>
              <input
                id="tenant-admin-password-confirmation"
                type="password"
                className="form-control"
                value={adminPasswordConfirmation}
                onChange={(e) => setAdminPasswordConfirmation(e.target.value)}
                placeholder="パスワード（確認）"
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        <div className="d-flex gap-2 justify-content-center">
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? `${submitLabel}中...` : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </button>
        </div>
      </form>
    </>
  );
}
