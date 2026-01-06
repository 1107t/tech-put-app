import { useParams, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

const messageMap = {
  login: {
    title: "ログインしました",
    body: "ようこそ！ログインが完了しました。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "success",
  },
  signup: {
    title: "登録しました",
    body: "アカウント登録が完了しました。ログインしてください。",
    backTo: { to: "/login", label: "ログインへ進む" },
    variant: "success",
  },
  reset: {
    title: "パスワード再設定",
    body: "再設定用リンクをメールに送信しました。メールをご確認ください。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "info",
  },
  resend: {
    title: "認証メールを再送しました",
    body: "認証メールを再送しました。受信トレイをご確認ください。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "info",
  },
  google: {
    title: "Googleログイン",
    body: "Googleでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "warning",
  },
  line: {
    title: "LINEログイン",
    body: "LINEでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "warning",
  },
  facebook: {
    title: "Facebookログイン",
    body: "Facebookでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
    variant: "warning",
  },
} as const;

type MessageType = keyof typeof messageMap;
type Variant = "success" | "info" | "warning" | "danger";

function isMessageType(v: string | undefined): v is MessageType {
  return !!v && v in messageMap;
}

function toAlertVariant(v: Variant) {
  // Bootstrap 5: alert-success / alert-info / alert-warning / alert-danger
  return `alert alert-${v}`;
}

export default function MessagePage() {
  const { type } = useParams<{ type: string }>();

  const message = isMessageType(type)
    ? messageMap[type]
    : {
        title: "メッセージ",
        body: `不明な type です: ${type ?? "(なし)"}`,
        backTo: { to: "/login", label: "ログインへ戻る" },
        variant: "danger" as const,
      };

  return (
    <AuthLayout subtitle="メッセージ" brandHref="/login">
      <div className={toAlertVariant(message.variant)} role="alert">
        <div className="fw-bold">{message.title}</div>
        <div className="mt-2">{message.body}</div>
      </div>

      <div className="d-grid gap-2">
        <Link className="btn btn-outline-primary" to={message.backTo.to}>
          {message.backTo.label}
        </Link>

        {/* デバッグ表示（不要なら削除OK） */}
        <div className="text-muted small text-center">type: {type ?? "(なし)"}</div>
      </div>
    </AuthLayout>
  );
}
