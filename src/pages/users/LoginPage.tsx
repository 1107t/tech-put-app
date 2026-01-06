import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16v12H4z" />
      <path d="M4 8l8 5 8-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v10H6z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users"); // ← 後で正しいパスに
        console.log(await res.json());
      } catch (e) {
        console.log("fetch skipped:", e);
      }
    })();
  }, []);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/message/login");
  };

  return (
    <AuthLayout
      subtitle="tech out put!"
      brandHref="/login"
      footer={
        <ul className="list-unstyled mb-0 d-grid gap-1">
          <li><Link className="link-primary text-decoration-none" to="/signup">アカウント登録</Link></li>
          <li><Link className="link-primary text-decoration-none" to="/reset">パスワードを忘れましたか？</Link></li>
          <li><Link className="link-primary text-decoration-none" to="/message/resend">認証メールの再送信</Link></li>
          <li><Link className="link-primary text-decoration-none" to="/message/google">Googleでのログイン</Link></li>
          <li><Link className="link-primary text-decoration-none" to="/message/line">LINEでのログイン</Link></li>
          <li><Link className="link-primary text-decoration-none" to="/message/facebook">Facebookでのログイン</Link></li>
        </ul>
      }
    >
      <form onSubmit={onLogin} className="d-grid gap-3">
        {/* Email */}
        <div>
          <label className="form-label fw-semibold">メールアドレス</label>
          <div className="input-group">
            <input type="email" required className="form-control" placeholder="example@mail.com" />
            <span className="input-group-text text-muted">
              <MailIcon />
            </span>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="form-label fw-semibold">パスワード</label>
          <div className="input-group">
            <input type="password" required className="form-control" placeholder="••••••••" />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        {/* Remember */}
        <div className="form-check d-flex justify-content-center">
          <input id="remember_me" type="checkbox" className="form-check-input" />
          <label htmlFor="remember_me" className="form-check-label fw-semibold ms-2">
            ログインを記録する
          </label>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary btn-lg w-100">
          ログイン
        </button>
      </form>
    </AuthLayout>
  );
}
