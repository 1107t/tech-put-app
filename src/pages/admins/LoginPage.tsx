import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ErrorMessage {
  id: number;
  message: string;
}

interface LoginProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  errorMessages?: ErrorMessage[];
  showRememberMe?: boolean;
  title?: string;
  subtitle?: string;
  showSocialLogin?: boolean;
}

const LoginPage: React.FC<LoginProps> = ({ 
  onSubmit, 
  errorMessages = [],
  showRememberMe = true,
  title = "TecPutt",
  subtitle = "tech out put!",
  showSocialLogin = true
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          {/* ヘッダー */}
          <div className="card-header text-center bg-white border-bottom py-4">
            <h1 className="mb-0 h4 fw-normal">{title}</h1>
            <p className="mb-0 h5 fw-normal">{subtitle}</p>
          </div>

          {/* サブタイトル */}
          <div className="card-body">
            <p className="text-center h6 mb-4">ログインしましょう！</p>

            {/* エラーメッセージ */}
            {errorMessages.length > 0 && (
              <div className="alert alert-danger" role="alert">
                {errorMessages.map((error) => (
                  <div key={error.id}>{error.message}</div>
                ))}
              </div>
            )}

            {/* フォーム */}
            <form onSubmit={handleSubmit}>
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
                    required
                    autoFocus
                  />
                  <span className="input-group-text bg-white">
                    📧
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
                    placeholder="パスワード"
                    required
                  />
                  <span className="input-group-text bg-white">
                    🔒
                  </span>
                </div>
              </div>

              {/* Remember Me */}
              {showRememberMe && (
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    ログインを記憶する
                  </label>
                </div>
              )}

              {/* ログインボタン */}
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            {/* リンク */}
            <div className="d-flex flex-column gap-2">
              <Link to="/signup" className="text-decoration-none text-primary">アカウント登録</Link>
              <Link to="/password-reset" className="text-decoration-none text-primary">パスワードを忘れましたか?</Link>
              <Link to="/resend-confirmation" className="text-decoration-none text-primary">認証メールの再送信</Link>
              {showSocialLogin && (
                <>
                  <Link to="/auth/google" className="text-decoration-none text-primary">Googleでログイン</Link>
                  <Link to="/auth/line" className="text-decoration-none text-primary">Lineでログイン</Link>
                  <Link to="/auth/facebook" className="text-decoration-none text-primary">Facebookでログイン</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;