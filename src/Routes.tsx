import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 一般ユーザー用ページ
import LoginPage from './pages/users/LoginPage';
import UserSignUpPage from './pages/users/SignUpPage';
import UserMessagePage from './pages/users/MessagePage';
import UserPassreset from './pages/users/Passreset';
import DashboardPage from './pages/users/DashboardPage';
<<<<<<< HEAD
import UserHomePage from './pages/users/UserDetailPage';
=======
import ArticlePostPage from './pages/users/article/Post';
>>>>>>> 2b73daa9406bf5a7668212a6da024ba1aaf99b4d

// 管理者用ページ
import AdminLoginPage from './pages/admins/AdminLoginPage';
import AdminSignUpPage from './pages/admins/SignUpPage';
import AdminMessagePage from './pages/admins/MessagePage';
import AdminPassreset from './pages/admins/Passreset';
import AdminDashboardPage from './pages/admins/AdminDashboardPage';
import AdminPage from './pages/adminpage';
import AdminDetail from './pages/admins/AdminDetail';
import AdminUsersPage from './pages/admins/AdminUsersPage';

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
<<<<<<< HEAD
        <Route path="/users/:id" element={<UserHomePage />} />
=======
        <Route path="/articles/new" element={<ArticlePostPage />} />
>>>>>>> 2b73daa9406bf5a7668212a6da024ba1aaf99b4d

        {/* 管理者用ルート（固定パスを先に定義） */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/message/:type" element={<AdminMessagePage />} />
        <Route path="/admin/reset" element={<AdminPassreset />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/articles" element={<div>記事一覧ページ（未実装）</div>} />
        <Route path="/admin/videos" element={<div>動画投稿一覧ページ（未実装）</div>} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/inquiries" element={<div>問い合わせ一覧ページ（未実装）</div>} />

        {/* 管理者詳細（動的パスは固定パスの後に定義） */}
        <Route path="/admin/:id" element={<AdminDetail />} />

        <Route path="/adminpage" element={<AdminPage />} />

        {/* 404ページ */}
        <Route path="*" element={<div>404 - ページが見つかりません</div>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
