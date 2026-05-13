import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { MailIcon } from "../../components/Icons";

export default function Passreset() {
  const navigate = useNavigate();

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin/message/resend");
  };

  return (
    <AuthLayout
      subtitle="パスワード再設定"
      brandHref="/admin/reset"
      footer={
        <ul className="list-unstyled mb-0 d-grid gap-1">
          <li>
            <Link className="link-primary text-decoration-none" to="/admin/signup">
              アカウント登録
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/admin/login">
              ログイン
            </Link>
          </li>
          <li>
            <Link className="link-primary text-decoration-none" to="/admin/message/resend">
              認証メールの再送信
            </Link>
          </li>
        </ul>
      }
    >
      <form onSubmit={onSend} className="d-grid gap-3">
        <div>
          <label className="form-label fw-semibold">メールアドレス</label>
          <div className="input-group">
            <input type="email" required className="form-control" placeholder="example@mail.com" />
            <span className="input-group-text text-muted">
              <MailIcon />
            </span>
          </div>
          <div className="form-text">
            登録済みのメールアドレス宛に、再設定用の案内を送信します。
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100">
          送信
        </button>
      </form>
    </AuthLayout>
  );
}