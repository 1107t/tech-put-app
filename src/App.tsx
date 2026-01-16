import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AdminLogin from './pages/admins/LoginPage';
import SignUpPage from './pages/admins/SignUpPage';
import AdminLoginPage from './pages/admins/AdminLoginPage';


const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>ダッシュボード</h1>
      <p>ログインに成功しました!</p>
    </div>
  );
};

// ユーザーログインページ用のコンポーネント
const UserLoginPageWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    try {
      console.log('ユーザーログイン情報:', data);
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AdminLogin 
      onSubmit={handleLogin}
      errorMessages={[]}
    />
  );
};

// 管理者用ダッシュボード
const AdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>管理者ダッシュボード</h1>
      <p>管理者としてログインに成功しました!</p>
    </div>
  );
};

// /admin/login用のラッパー（AdminLoginPageを直接表示）
const AdminLoginPageWrapper = () => {
  return <AdminLoginPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ユーザー用ルート */}
        <Route path="/" element={<UserLoginPageWrapper />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 管理者用ルート */}
        <Route path="/admin/login" element={<AdminLoginPageWrapper />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;