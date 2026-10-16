// アプリのURLとページを対応付ける。
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
import AdminUserDetailPage from './pages/admins/AdminUserDetailPage';
import AdminVideoIndexPage from './pages/admins/video/Index';
import AdminVideoNewPage from './pages/admins/video/New';
import AdminVideoEditPage from './pages/admins/video/Edit';
import AdminVideoShowPage from './pages/admins/video/Show';
// ユーザー別つぶやき一覧ページ（PR #21 で追加）
import AdminUserTweetsPage from './pages/admins/AdminUserTweetsPage';
import AdminUserArticlesPage from './pages/admins/AdminUserArticlesPage';
import AdminUserPostsPage from './pages/admins/AdminUserPostsPage';
import AdminArticleIndexPage from './pages/admins/article/Index';
import AdminArticleNewPage from './pages/admins/article/New';
import AdminArticleEditPage from './pages/admins/article/Edit';
import AdminArticleShowPage from './pages/admins/article/Show';

// マネージャー用ページ
import ManagerLoginPage from './pages/managers/ManagerLoginPage';
import ManagerDashboardPage from './pages/managers/ManagerDashboardPage';
import TenantNewPage from './pages/managers/TenantNewPage';
import TenantDetailPage from './pages/managers/TenantDetailPage';

// アプリのルーティングを管理するコンポーネント。全ページのURL設定をここで一元管理する。
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* テナントを特定できないため、特定のテナントへは振り分けずマネージャーのログインへ送る（暫定） */}
        <Route path="/" element={<Navigate to="/manager/login" replace />} />

        {/* 一般ユーザー用ルート。
            未ログイン時の認証系のみ /tenant/:tenantId/users 配下にスコープする
            （ログイン後は current_user からテナントが特定できるため、URLに含めない）。 */}
        <Route path="/tenant/:tenantId/users/login" element={<LoginPage />} />
        <Route path="/tenant/:tenantId/users/signup" element={<UserSignUpPage />} />
        <Route path="/tenant/:tenantId/users/message/:type" element={<UserMessagePage />} />
        <Route path="/tenant/:tenantId/users/reset" element={<UserPassreset />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tweets" element={<TweetIndex />} />
        <Route path="/articles" element={<ArticleIndexPage />} />
        <Route path="/articles/new" element={<ArticlePostPage />} />
        <Route path="/articles/:id/edit" element={<ArticleEditPage />} />
        <Route path="/articles/:id" element={<ArticleShowPage />} />

        {/* 管理者用ルート */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/message/:type" element={<AdminMessagePage />} />
        <Route path="/admin/reset" element={<AdminPassreset />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/articles" element={<AdminArticleIndexPage />} />
        <Route path="/admin/articles/new" element={<AdminArticleNewPage />} />
        <Route path="/admin/articles/:id/edit" element={<AdminArticleEditPage />} />
        <Route path="/admin/articles/:id" element={<AdminArticleShowPage />} />
        <Route path="/admin/videos" element={<AdminVideoIndexPage />} />
        <Route path="/admin/videos/new" element={<AdminVideoNewPage />} />
        <Route path="/admin/videos/:id/edit" element={<AdminVideoEditPage />} />
        <Route path="/admin/videos/:id" element={<AdminVideoShowPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        {/* 受講生別の投稿一覧・詳細 */}
        <Route path="/admin/users/:userId/tweets" element={<AdminUserTweetsPage />} />
        <Route path="/admin/users/:userId/articles" element={<AdminUserArticlesPage />} />
        <Route path="/admin/users/:userId/posts" element={<AdminUserPostsPage />} />
        <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        <Route path="/admin/inquiries" element={<div>問い合わせ一覧ページ（未実装）</div>} />

        <Route path="/admin/:id" element={<AdminDetail />} />

        <Route path="/adminpage" element={<AdminPage />} />

        {/* マネージャー用ルート */}
        <Route path="/manager/login" element={<ManagerLoginPage />} />
        <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manager/tenants/new" element={<TenantNewPage />} />
        <Route path="/manager/tenants/:id" element={<TenantDetailPage />} />

        {/* 404ページ */}
        <Route path="*" element={<div>404 - ページが見つかりません</div>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
