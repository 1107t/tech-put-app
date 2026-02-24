// src/pages/admins/AdminDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "../../lib/adminStore";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

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