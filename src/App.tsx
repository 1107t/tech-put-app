import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ユーザー用ページ
import LoginPage from './pages/users/LoginPage';
import SignUpPage from './pages/users/SignUpPage';
import Passreset from './pages/users/Passreset';
import MessagePage from './pages/users/MessagePage';
import DashboardPage from './pages/DashboardPage';

// 管理者用ページ
import AdminLoginPage from './pages/admins/AdminLoginPage';

// 管理者用ダッシュボード
const AdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>管理者ダッシュボード</h1>
      <p>管理者としてログインに成功しました!</p>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* デフォルトルート */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ユーザー用ルート */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset" element={<Passreset />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/message/:type" element={<MessagePage />} />

      {/* 管理者用ルート */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* 404ページ */}
      <Route path="*" element={<div className="p-4">Not Found</div>} />
    </Routes>
  );
}