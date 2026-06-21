// src/pages/admins/AdminDetail.tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin, loading, handleLogout } = useRequireAdmin();

  useEffect(() => {
    if (!admin) return;
    if (id !== admin.id) navigate(`/admin/${admin.id}`, { replace: true });
  }, [admin, id, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  const infoItems = [
    { id: 1, label: "名前：", value: admin?.name },
    { id: 2, label: "メールアドレス：", value: admin?.email },
  ];

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column" style={{ minHeight: "380px" }}>
              <div className="text-center pb-3 mb-4" style={{ borderBottom: "1px solid #e9ecef" }}>
                <h5 className="mb-0">管理者詳細画面</h5>
              </div>
              <div className="d-flex flex-column align-items-start flex-grow-1">
                <div className="position-relative mb-3 align-self-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "120px", height: "120px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg width="70" height="70" fill="white" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                    </svg>
                  </div>
                  <button
                    className="btn btn-primary rounded-circle p-0 position-absolute"
                    style={{ width: "36px", height: "36px", bottom: "0", right: "0", border: "3px solid white" }}
                  >
                    <svg width="20" height="20" fill="white" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                  </button>
                </div>
                <div className="w-100 px-3">
                  {infoItems.map((item) => (
                    item.value && (
                      <div key={item.id} className="d-flex align-items-center py-3" style={{ borderBottom: "1px solid #e9ecef" }}>
                        <span className="text-muted" style={{ fontSize: "14px", minWidth: "120px" }}>{item.label}</span>
                        <span style={{ fontSize: "14px", color: "#333" }}>{item.value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
