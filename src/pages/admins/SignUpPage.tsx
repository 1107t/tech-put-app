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
          <div className="card-header text-center bg-white border-bottom-0 pt-4 pb-2">
            <h1 className="mb-0 h2 fw-bold text-decoration-underline" style={{ textDecorationColor: '#0d6efd', textDecorationThickness: '3px' }}>
              Nature Technology
            </h1>
          </div>

          {/* サブタイトル */}
          <div className="card-body pt-2">
            <p className="text-center mb-4">アカウント登録を行いましょう！</p>

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
                    placeholder="名前（フルネーム）"
                    required
                  />
                  <span className="input-group-text bg-light">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
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
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
                    </svg>
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
                  <span className="input-group-text bg-light">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
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
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
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
                アカウント登録
              </button>
            </form>

            {/* リンク */}
            <div className="d-flex flex-column gap-2">
              <Link to="/admin/login" className="text-decoration-none">ログイン</Link>
              <Link to="/password-reset" className="text-decoration-none">認証メールの再送信</Link>
              <Link to="/auth/google" className="text-decoration-none">Googleでログイン</Link>
              <Link to="/auth/line" className="text-decoration-none">Lineでログイン</Link>
              <Link to="/auth/facebook" className="text-decoration-none">Facebookでログイン</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;