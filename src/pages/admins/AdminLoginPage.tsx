import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessages(errorData.errors || ['ログインに失敗しました']);
        return;
      }

      const result = await response.json();
      console.log('ログイン成功:', result);
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessages(['ネットワークエラーが発生しました。もう一度お試しください。']);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          {/* ヘッダー */}
          <div className="card-header text-center bg-white border-bottom-0 pt-4 pb-2">
            <h1 className="mb-0 h2 fw-bold text-decoration-underline" style={{ textDecorationColor: '#0d6efd', textDecorationThickness: '3px' }}>
              TECH-PUT
            </h1>
            <p className="text-muted mt-2">管理者ログイン画面</p>
          </div>

          {/* ボディ */}
          <div className="card-body pt-2">
            {errorMessages.length > 0 && (
              <div className="alert alert-danger">
                {errorMessages.map((msg, index) => (
                  <p key={index} className="mb-0">{msg}</p>
                ))}
              </div>
            )}

            <p className="text-center mb-4">ログインしましょう！</p>

            <form onSubmit={handleSubmit}>
              {/* メールアドレス */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="form-control"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="input-group-text bg-light">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* ログインを記憶する */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-check-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  ログインを記憶する
                </label>
              </div>

              {/* ログインボタン */}
              <button type="submit" className="btn btn-primary w-100 mb-3">
                ログイン
              </button>
            </form>

            {/* リンク */}
            <div className="d-flex flex-column gap-2">
              <a href="/admin/signup" className="text-decoration-none">アカウント登録</a>
              <a href="/admin/reset" className="text-decoration-none">パスワードを忘れましたか?</a>
              <a href="/admin/resend" className="text-decoration-none">認証メールの再送信</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;