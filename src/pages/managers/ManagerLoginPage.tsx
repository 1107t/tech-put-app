import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { MailIcon, LockIcon } from "../../components/Icons";
import { managerLogin, getCurrentManager } from "../../lib/managerApi";
import { getApiErrorMessage } from "../../lib/api";

export default function ManagerLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("manager_remember_email");
    if (saved) setEmail(saved);

    getCurrentManager().then((manager) => {
      if (manager) navigate("/manager/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("メールアドレスとパスワードを入力してください。");
      }

      if (remember) localStorage.setItem("manager_remember_email", email);
      else localStorage.removeItem("manager_remember_email");

      await managerLogin(email, password);

      navigate("/manager/dashboard", { replace: true });
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "ログインに失敗しました。"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="マネージャーログイン" brandHref="/manager/login">
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        {errorMsg && (
          <div className="alert alert-danger py-2 mb-0" role="alert">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="form-label fw-semibold">メールアドレス</label>
          <div className="input-group">
            <input
              type="email"
              required
              className="form-control"
              placeholder="manager@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <span className="input-group-text text-muted">
              <MailIcon />
            </span>
          </div>
        </div>

        <div>
          <label className="form-label fw-semibold">パスワード</label>
          <div className="input-group">
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        <div className="form-check d-flex justify-content-center">
          <input
            id="remember_me"
            type="checkbox"
            className="form-check-input"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="remember_me" className="form-check-label fw-semibold ms-2">
            ログインを記録する
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          disabled={loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </AuthLayout>
  );
}
