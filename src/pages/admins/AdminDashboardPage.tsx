// src/pages/admins/AdminDashboardPage.tsx 【修正】
// 管理者ダッシュボードページ。管理者ログイン後のトップ画面。
// 未ログイン時は /admin/login にリダイレクトする認証ガード付き。
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "../../lib/adminStore";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // マウント時: ログイン状態を確認し、未ログインなら /admin/login へリダイレクト
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);
      setLoading(false);
    })();
    // アンマウント時にフラグを立て、非同期処理後のstate更新を防ぐ
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <h4>ダッシュボード</h4>
      <p>ログイン成功！ダッシュボードです。</p>
    </AdminLayout>
  );
}