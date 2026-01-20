import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/AdminLogin.css";

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
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1 className="admin-login-title">Nature Technology</h1>
          <p className="admin-login-subtitle">管理者ログイン画面</p>
        </div>

        <div className="admin-login-body">
          {errorMessages.length > 0 && (
            <div className="alert alert-danger">
              {errorMessages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </div>
          )}

          <p className="login-message">ログインしましょう！</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="input-icon">📧</span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>ログインを記憶する</span>
              </label>
            </div>

            <button type="submit" className="login-button">
              ログイン
            </button>
          </form>

          <div className="login-links">
            <a href="/signup" className="login-link">アカウント登録</a>
            <a href="/reset" className="login-link">パスワードを忘れましたか?</a>
            <a href="/resend" className="login-link">認証メールの再送信</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;