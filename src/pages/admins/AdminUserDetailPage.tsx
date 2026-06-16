// src/pages/admins/AdminUserDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAdmin, adminLogout, getAdminUser, type Admin } from "../../lib/adminApi";
import type { AdminUser } from "../../lib/userTypes";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminUserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
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
      if (id) {
        const userData = await getAdminUser(id);
        if (!cancelled) setUser(userData);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [navigate, id]);

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

  if (!user) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-muted">ユーザーが見つかりません。</p>
      </AdminLayout>
    );
  }

  const infoItems = [
    { label: "名前：", value: user.name },
    { label: "メールアドレス：", value: user.email },
    { label: "記事投稿数：", value: String(user.articlesCount) },
    { label: "動画投稿数：", value: String(user.postsCount) },
    { label: "つぶやき数：", value: String(user.tweetsCount) },
  ];

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column" style={{ minHeight: "380px" }}>
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">ユーザー詳細画面</h5>
              </div>
              <div className="d-flex flex-column align-items-start flex-grow-1">
                <div className="position-relative mb-3 align-self-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "120px", height: "120px",
                      background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg width="70" height="70" fill="white" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                    </svg>
                  </div>
                </div>
                <div className="w-100 px-3">
                  {infoItems.map((item) => (
                    <div key={item.label} className="d-flex align-items-center py-3" style={{ borderBottom: "1px solid #e9ecef" }}>
                      <span className="text-muted" style={{ fontSize: "14px", minWidth: "140px" }}>{item.label}</span>
                      <span style={{ fontSize: "14px", color: "#333" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
