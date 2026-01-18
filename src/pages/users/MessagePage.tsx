import { useParams, Link } from "react-router-dom";

export default function MessagePage() {
  const { type } = useParams();

  const titleMap: Record<string, string> = {
    login: "ログインしました",
    google: "Googleログイン",
    line: "LINEログイン",
    facebook: "Facebookログイン",
    resend: "認証メール再送",
  };

  const title = titleMap[type ?? ""] ?? "メッセージ";

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-sm" style={{ maxWidth: 520, width: "100%" }}>
        <div className="card-body p-4">
          <h1 className="h4 fw-bold">{title}</h1>
          <p className="text-muted mt-2 mb-4">
            この機能はまだ未実装です。後で実装します。
          </p>

          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-secondary">
              ログインへ戻る
            </Link>
            <Link to="/dashboard" className="btn btn-primary">
              ダッシュボードへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
