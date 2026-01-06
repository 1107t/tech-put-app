import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

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

export default function SignUpPage() {
  const navigate = useNavigate();

  const onSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("アカウント登録しました");
    navigate("/message/signup");
  };

  return (
    <AuthLayout
      subtitle="アカウント登録を行いましょう！"
      brandHref="/signup"
      footer={
        <div className="text-center">
          <Link className="link-primary text-decoration-none" to="/login">
            ログインへ戻る
          </Link>
        </div>
      }
    >
      <form onSubmit={onSignup} className="d-grid gap-3">
        {/* name */}
        <div>
          <label className="form-label fw-semibold">名前（フルネーム）</label>
          <div className="input-group">
            <input type="text" required className="form-control" placeholder="山田 太郎" />
            <span className="input-group-text text-muted">
              <UserIcon />
            </span>
          </div>
        </div>

        {/* email */}
        <div>
          <label className="form-label fw-semibold">メールアドレス</label>
          <div className="input-group">
            <input type="email" required className="form-control" placeholder="example@mail.com" />
            <span className="input-group-text text-muted">
              <MailIcon />
            </span>
          </div>
        </div>

        {/* password */}
        <div>
          <label className="form-label fw-semibold">パスワード</label>
          <div className="input-group">
            <input type="password" required className="form-control" placeholder="••••••••" />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        {/* password confirm */}
        <div>
          <label className="form-label fw-semibold">パスワード（確認用）</label>
          <div className="input-group">
            <input type="password" required className="form-control" placeholder="••••••••" />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        {/* agree */}
        <div className="form-check d-flex justify-content-center">
          <input id="agree" type="checkbox" className="form-check-input" required />
          <label htmlFor="agree" className="form-check-label fw-semibold ms-2">
            利用規約に同意する
          </label>
        </div>

        {/* button */}
        <button type="submit" className="btn btn-primary btn-lg w-100">
          登録
        </button>
      </form>
    </AuthLayout>
  );
}
