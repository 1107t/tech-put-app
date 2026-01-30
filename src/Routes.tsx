import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 一般ユーザー用ページ
import LoginPage from './pages/users/LoginPage';
import UserSignUpPage from './pages/users/SignUpPage';
import UserMessagePage from './pages/users/MessagePage';
import UserPassreset from './pages/users/Passreset';

// 管理者用ページ
import AdminLoginPage from './pages/admins/AdminLoginPage';
import AdminSignUpPage from './pages/admins/SignUpPage';  // ← ここを SignUpPage に修正

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ルートパスから /login へリダイレクト（最初に配置） */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 一般ユーザー用ルート */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<UserSignUpPage />} />
        <Route path="/message" element={<UserMessagePage />} />
        

        {/* 管理者用ルート */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/message/:type" element={<UserMessagePage />} />
        <Route path="/admin/reset" element={<UserPassreset />} />
        <Route path="/admin/dashboard" element={<div>管理者ダッシュボード（未実装）</div>} />

        {/* デフォルトルート */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404ページ */}
        <Route path="*" element={<div>404 - ページが見つかりません</div>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;