import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
//import AuthLayout from "../../components/AuthLayout";
import { MailIcon, LockIcon } from "../../components/Icons";
import { registerAdmin } from "../../lib/adminStore";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

export default function AdminSignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    agreeTerms: false,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // エラーメッセージをクリア
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // バリデーション
      if (formData.password !== formData.passwordConfirmation) {
        setError("パスワードが一致しません");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        setLoading(false);
        return;
      }

      // 管理者登録
      await registerAdmin(formData.email, formData.password, formData.name);

      console.log("管理者登録成功！");
      alert("管理者アカウントを登録しました!");
      navigate("/admin/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "登録に失敗しました。もう一度お試しください。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          {/* ヘッダー */}
          <div className="card-header text-center bg-white border-bottom-0 pt-4 pb-2">
            <h1
              className="mb-0 h2 fw-bold text-decoration-underline"
              style={{
                textDecorationColor: "#0d6efd",
                textDecorationThickness: "3px",
              }}
            >
              TECH-PUT
            </h1>
            <p className="text-muted mt-2">管理者アカウント登録</p>
          </div>

          {/* サブタイトル */}
          <div className="card-body pt-2">
            <p className="text-center mb-4">アカウント登録を行いましょう!</p>

            {/* エラーメッセージ */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* フォーム */}
            <form onSubmit={handleSubmit}>
              {/* 名前 */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="名前(フルネーム)"
                    required
                  />
                  <span className="input-group-text bg-light">
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* メールアドレス */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="メールアドレス"
                    autoComplete="email"
                    required
                  />
                  <span className="input-group-text bg-light">
                    <MailIcon />
                  </span>
                </div>
              </div>

              {/* パスワード */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="パスワード(6文字以上)"
                    autoComplete="new-password"
                    required
                  />
                  <span className="input-group-text bg-light">
                    <LockIcon />
                  </span>
                </div>
              </div>

              {/* パスワード確認 */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="password"
                    name="passwordConfirmation"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="パスワード確認用"
                    autoComplete="new-password"
                    required
                  />
                  <span className="input-group-text bg-light">
                    <LockIcon />
                  </span>
                </div>
              </div>

              {/* 利用規約チェックボックス */}
              <div className="form-check mb-3 d-flex justify-content-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="form-check-input"
                  required
                />
                <label
                  className="form-check-label fw-semibold ms-2"
                  htmlFor="agreeTerms"
                >
                  <Link to="/terms" className="text-decoration-none">
                    利用規約
                  </Link>
                  に同意する
                </label>
              </div>

              {/* 登録ボタン */}
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={!formData.agreeTerms || loading}
              >
                {loading ? "登録中..." : "アカウント登録"}
              </button>
            </form>

            <div className="text-center">
              <Link
                className="link-primary text-decoration-none"
                to="/admin/login"
              >
                ログインへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}