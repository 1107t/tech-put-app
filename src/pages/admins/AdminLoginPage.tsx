// src/pages/admin/AdminLoginPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { MailIcon, LockIcon } from "../../components/Icons";
import { adminLogin } from "../../lib/adminStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRememberedEmail = () => {
      if (cancelled) return;
      const saved = localStorage.getItem("admin_remember_email");
      if (saved) setEmail(saved);
    };

    loadRememberedEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("メールアドレスとパスワードを入力してください。");
      }

      if (remember) localStorage.setItem("admin_remember_email", email);
      else localStorage.removeItem("admin_remember_email");

      await adminLogin(email, password);

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "不明なエラーが発生しました。";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      subtitle="管理者ログイン"
      brandHref="/admin/login"
      footer={
        <ul className="list-unstyled mb-0 d-grid gap-1">
          <li>
            <Link className="link-primary text-decoration-none" to="/admin/signup">
              アカウント登録
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/admin/reset">
              パスワードを忘れましたか?
            </Link>
          </li>
          <li>
            <Link
              className="link-primary text-decoration-none"
              to="/admin/message/resend"
            >
              認証メールの再送信
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/message/google">
              Googleでのログイン
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/message/line">
              LINEでのログイン
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/message/facebook">
              Facebookでのログイン
            </Link>
          </li>
        </ul>
      }
    >
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
              placeholder="admin@example.com"
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