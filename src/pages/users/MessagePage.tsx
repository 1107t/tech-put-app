import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { logout } from "../../lib/usersStore";


export default function MessagePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const title =
    type === "signup" ? "アカウント登録しました。" :
      type === "login" ? "ログインしました。" :
        "完了しました。";

  return (
    <AuthLayout
      subtitle={title}
      brandHref="/login"
      footer={
        <button
          className="btn btn-link"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          ログインへ戻る
        </button>
      }
    >
      <div className="text-center text-muted">type: {type}</div>
    </AuthLayout>
  );
}
