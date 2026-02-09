import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 一般ユーザー用ページ
import LoginPage from './pages/users/LoginPage';
import UserSignUpPage from './pages/users/SignUpPage';
import UserMessagePage from './pages/users/MessagePage';
import UserPassreset from './pages/users/Passreset';
import DashboardPage from './pages/users/DashboardPage'; 

// 管理者用ページ
import AdminLoginPage from './pages/admins/AdminLoginPage';
import AdminSignUpPage from './pages/admins/SignUpPage';
import AdminMessagePage from './pages/admins/MessagePage';
import AdminPassreset from './pages/admins/Passreset';
import AdminDashboardPage from './pages/admins/AdminDashboardPage';
import AdminPage from './pages/adminpage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ルートパスから /login へリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 一般ユーザー用ルート */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<UserSignUpPage />} />
        <Route path="/message/:type" element={<UserMessagePage />} />
        <Route path="/reset" element={<UserPassreset />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 管理者用ルート */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/message/:type" element={<AdminMessagePage />} />
        <Route path="/admin/reset" element={<AdminPassreset />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/adminpage" element={<AdminPage />} />

        {/* 404ページ */}
        <Route path="*" element={<div>404 - ページが見つかりません</div>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;