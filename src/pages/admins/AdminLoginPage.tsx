import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';
import "./styles/login-page.css";

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('ユーザーログイン情報:', { email, password, rememberMe });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate('/admin/dashboard');
      
    } catch (error) {
      setErrors(['ログインに失敗しました。メールアドレスとパスワードを確認してください。']);
    }
  };

  return (
    <div className="login-page-container">
      <div className="register-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <Link to="/" className="h1">
              <b>TecPutt</b>
            </Link>
          </div>
          <div className="card-body">
            <p className="login-box-msg">管理者用ログイン</p>
            
            {errors.length > 0 && (
              <div className="alert alert-danger">
                <ul className="mb-0">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                />
                <span className="input-group-text">
                  <MdEmail />
                </span>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <span className="input-group-text">
                  <MdLock />
                </span>
              </div>

              <div className="row">
                <div className="col-8">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember_me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="remember_me">
                      ログイン状態を保持する
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <button type="submit" className="btn btn-primary w-100">
                    ログイン
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3">
              <p className="mb-1">
                <Link to="/admin/password/forgot">パスワードを忘れた場合</Link>
              </p>
              <p className="mb-0">
                <Link to="/admin/signup">新規登録</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;