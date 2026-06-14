// src/Routes.tsx
// アプリ全体のルーティング定義。URLパスとページコンポーネントを対応付ける。
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 一般ユーザー用ページ
import LoginPage from './pages/users/LoginPage';
import UserSignUpPage from './pages/users/SignUpPage';
import UserMessagePage from './pages/users/MessagePage';
import UserPassreset from './pages/users/Passreset';
import DashboardPage from './pages/users/DashboardPage';
import TweetIndex from './pages/users/tweet/Index';
import ArticlePostPage from './pages/users/article/Post';
import ArticleIndexPage from './pages/users/article/Index';
import ArticleEditPage from './pages/users/article/Edit';
import ArticleShowPage from './pages/users/article/Show';

// 管理者用ページ
import AdminLoginPage from './pages/admins/AdminLoginPage';
import AdminSignUpPage from './pages/admins/SignUpPage';
import AdminMessagePage from './pages/admins/MessagePage';
import AdminPassreset from './pages/admins/Passreset';
import AdminDashboardPage from './pages/admins/AdminDashboardPage';
import AdminPage from './pages/adminpage';
import AdminDetail from './pages/admins/AdminDetail';
import AdminUsersPage from './pages/admins/AdminUsersPage';
import AdminVideosPage from './pages/admins/AdminVideosPage';
import AdminVideoPostPage from './pages/admins/AdminVideoPostPage';

// アプリのルーティングを管理するコンポーネント。全ページのURL設定をここで一元管理する。
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
        <Route path="/tweets" element={<TweetIndex />} />
        <Route path="/articles" element={<ArticleIndexPage />} />
        <Route path="/articles/new" element={<ArticlePostPage />} />
        <Route path="/articles/:id/edit" element={<ArticleEditPage />} />
        <Route path="/articles/:id" element={<ArticleShowPage />} />

        {/* 管理者用ルート（固定パスを先に定義） */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/message/:type" element={<AdminMessagePage />} />
        <Route path="/admin/reset" element={<AdminPassreset />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/articles" element={<div>記事一覧ページ（未実装）</div>} />
        <Route path="/admin/videos" element={<AdminVideosPage />} />
        <Route path="/admin/videos/new" element={<AdminVideoPostPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/inquiries" element={<div>問い合わせ一覧ページ（未実装）</div>} />

        {/* 管理者詳細（動的パスは固定パスの後に定義） */}
        <Route path="/admin/:id" element={<AdminDetail />} />

        <Route path="/adminpage" element={<AdminPage />} />

        {/* TODO(manager): マネージャー用ルートを追加する
            /manager/login, /manager/dashboard など admin セクションに倣って実装 */}

        {/* 404ページ */}
        <Route path="*" element={<div>404 - ページが見つかりません</div>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
