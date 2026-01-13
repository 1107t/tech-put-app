import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // CSSをインポート

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  errorMessages?: string[];
  showRememberMe?: boolean;
}

const AdminLogin: React.FC<LoginProps> = ({ 
  onSubmit, 
  errorMessages = [],
  showRememberMe = true 
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
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#e8eef3' }}>
      <div className="card shadow-sm custom-login-card" style={{ width: '400px' }}>
        {/* ヘッダー */}
        <div className="card-header text-center custom-login-header py-4">
          <h1 className="mb-0 custom-login-title">
            TecPutt
          </h1>
        </div>

        {/* サブタイトル */}
        <div className="card-body pb-0">
          <p className="text-center h5 mb-4 custom-subtitle">tech out put!</p>

          {/* エラーメッセージ */}
          {errorMessages.length > 0 && (
            <div className="alert alert-danger" role="alert">
              {errorMessages.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="pt-3">
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
                  style={{ borderRight: 'none' }}
                />
                <span className="input-group-text custom-input-icon">
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
                  style={{ borderRight: 'none' }}
                />
                <span className="input-group-text custom-input-icon">
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
          <div className="custom-links">
            <div className="d-flex flex-column gap-2 pb-3">
              <a href="/signup" className="text-decoration-none">アカウント登録</a>
              <a href="/password-reset" className="text-decoration-none">パスワードを忘れましたか？</a>
              <a href="/resend-confirmation" className="text-decoration-none">認証メールの再送信</a>
              <a href="/auth/google" className="text-decoration-none">Googleでログイン</a>
              <a href="/auth/line" className="text-decoration-none">Lineでログイン</a>
              <a href="/auth/facebook" className="text-decoration-none">Facebookでログイン</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;