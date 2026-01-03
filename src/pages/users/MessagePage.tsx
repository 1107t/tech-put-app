import { useParams, Link } from "react-router-dom";

const messageMap = {
  login: {
    title: "ログインしました",
    body: "ようこそ！ログインが完了しました。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
  signup: {
    title: "登録しました",
    body: "アカウント登録が完了しました。ログインしてください。",
    backTo: { to: "/login", label: "ログインへ進む" },
  },
  reset: {
    title: "パスワード再設定",
    body: "再設定用リンクをメールに送信しました。メールをご確認ください。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
  resend: {
    title: "認証メールを再送しました",
    body: "認証メールを再送しました。受信トレイをご確認ください。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
  google: {
    title: "Googleログイン",
    body: "Googleでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
  line: {
    title: "LINEログイン",
    body: "LINEでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
  facebook: {
    title: "Facebookログイン",
    body: "Facebookでのログイン機能は準備中です。",
    backTo: { to: "/login", label: "ログインへ戻る" },
  },
} as const;

type MessageType = keyof typeof messageMap;

function isMessageType(v: string | undefined): v is MessageType {
  return !!v && v in messageMap;
}

export default function MessagePage() {
  const { type } = useParams<{ type: string }>();

  const message = isMessageType(type)
    ? messageMap[type]
    : {
        title: "メッセージ",
        body: `不明な type です: ${type ?? "(なし)"}`,
        backTo: { to: "/login", label: "ログインへ戻る" },
      };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{message.title}</h1>
        <p className="mt-2 text-gray-600">{message.body}</p>

        <Link
          className="mt-4 inline-block text-blue-600 hover:underline"
          to={message.backTo.to}
        >
          {message.backTo.label}
        </Link>

        {/* デバッグ表示（不要なら削除OK） */}
        <p className="mt-6 text-xs text-gray-400">type: {type}</p>
      </div>
    </div>
  );
}
