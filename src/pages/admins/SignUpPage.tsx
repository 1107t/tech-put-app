import React, { useState } from 'react';
import './RegisterBox.css';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const RegisterBox: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('利用規約に同意してください');
      return;
    }
    console.log('Form submitted:', formData);
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h1 className="h2">
              <b>Nature Technology</b>
            </h1>
          </div>
          <div className="card-body">
            <p className="login-box-msg">アカウント登録を行いましょう！</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="名前（フルネーム）"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-user"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="メールアドレス"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="パスワード"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  name="passwordConfirmation"
                  className="form-control"
                  placeholder="パスワード確認用"
                  autoComplete="new-password"
                  required
                  value={formData.passwordConfirmation}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      name="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label htmlFor="agreeTerms">
                      <a href="/use">利用規約</a>に同意する
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={!agreeTerms}
                  >
                    登録する
                  </button>
                </div>
              </div>
            </form>

            <div className="social-auth-links text-center mt-3 mb-3">
              <a href="#" className="btn btn-block btn-primary">
                <i className="fab fa-facebook mr-2"></i> Facebookでログイン
              </a>
              <a href="#" className="btn btn-block btn-danger">
                <i className="fab fa-google-plus mr-2"></i> Googleでログイン
              </a>
            </div>

            <p className="text-center">
              すでにアカウントをお持ちですか？{' '}
              <a href="/login">ログイン</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterBox;