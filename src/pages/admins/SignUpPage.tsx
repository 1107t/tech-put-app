import { Link } from "react-router-dom";

export default function AdminSignUpPage() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          {/* ヘッダー */}
          <div className="card-header text-center bg-white border-bottom-0 pt-4 pb-2">
            <h1
              className="mb-0 h2 fw-bold text-decoration-underline"
              style={{
                textDecorationColor: "#0d6efd",
                textDecorationThickness: "3px",
              }}
            >
              TECH-PUT
            </h1>
            <p className="text-muted mt-2">管理者アカウント登録</p>
          </div>

          {/* サブタイトル */}
          <div className="card-body pt-2">
            <div className="alert alert-info" role="alert">
              <p className="mb-1 fw-semibold">管理者アカウントの登録について</p>
              <p className="mb-0 small">
                管理者アカウントはシステム管理者が発行します。
                アカウントが必要な場合はシステム管理者にお問い合わせください。
              </p>
            </div>
            <div className="text-center mt-3">
              <Link
                className="link-primary text-decoration-none"
                to="/admin/login"
              >
                ログインへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}