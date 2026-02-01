import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CurrentUser {
  id: number;
  email: string;
  name: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // sessionStorageからユーザー情報を取得
    const userStr = sessionStorage.getItem('currentUser');
    
    if (!userStr) {
      // ログインしていなければログインページへ
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">TECH-PUT - 管理画面</span>
          <button 
            className="btn btn-outline-light"
            onClick={handleLogout}
          >
            ログアウト
          </button>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-white">
                <h2 className="mb-0">管理者ダッシュボード</h2>
              </div>
              <div className="card-body">
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">登録完了！</h4>
                  <p>管理者アカウントの登録が正常に完了しました。</p>
                </div>

                <h4 className="mt-4">ようこそ、{currentUser.name}さん！</h4>
                
                <div className="mt-4">
                  <h5>登録情報</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th scope="row" className="bg-light" style={{width: '200px'}}>ユーザーID</th>
                        <td>{currentUser.id}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="bg-light">名前</th>
                        <td>{currentUser.name}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="bg-light">メールアドレス</th>
                        <td>{currentUser.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <h5>管理メニュー</h5>
                  <ul>
                    <li>ユーザー管理</li>
                    <li>コンテンツ管理</li>
                    <li>システム設定</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;