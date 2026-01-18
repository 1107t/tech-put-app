import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('新規登録情報:', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          {/* ヘッダー */}
          <div className="card-header text-center bg-primary text-white py-4">
            <h1 className="mb-0 h2 fw-bold">
              Nature Technology
            </h1>
          </div>

          {/* サブタイトル */}
          <div className="card-body">
            <p className="text-center h5 mb-4 text-muted">アカウント登録を行いましょう!</p>

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
                  <span className="input-group-text bg-white">
                    👤
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
                    autoFocus
                    required
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
                    autoComplete="new-password"
                    required
                  />
                  <span className="input-group-text bg-white">
                    🔒
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
                  <span className="input-group-text bg-white">
                    🔒
                  </span>
                </div>
              </div>

              {/* 利用規約チェックボックス */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="form-check-input"
                  required
                />
                <label className="form-check-label" htmlFor="agreeTerms">
                  <Link to="/terms" className="text-decoration-none">利用規約</Link>に同意する
                </label>
              </div>

              {/* 登録ボタン */}
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={!formData.agreeTerms}
              >
                登録
              </button>
            </form>

            {/* リンク */}
            <div className="d-flex flex-column gap-2">
              <Link to="/" className="text-decoration-none text-primary">ログイン</Link>
              <Link to="/password-reset" className="text-decoration-none text-primary">パスワードを忘れましたか？</Link>
              <Link to="/resend-confirmation" className="text-decoration-none text-primary">認証メールの再送信</Link>
              <a href="/auth/google" className="text-decoration-none text-primary">Googleでログイン</a>
              <a href="/auth/line" className="text-decoration-none text-primary">Lineでログイン</a>
              <a href="/auth/facebook" className="text-decoration-none text-primary">Facebookでログイン</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;