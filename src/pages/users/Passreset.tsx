import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";


function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4z" />
      <path d="M4 8l8 5 8-5" />
    </svg>
  );
}

export default function Passreset() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users"); // ← ここは後で正しいパスに直す
      console.log(await res.json());
    })().catch(console.error);
  }, []);
  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/message/resend");
  };

  return (
    <AuthLayout subtitle="tech out put!" brandHref="/reset"
      footer={
        <div className="space-y-1">
          <div><Link className="text-blue-600 hover:underline" to="/signup">アカウント登録</Link></div>
          <div><Link className="text-blue-600 hover:underline" to="/reset">パスワードを忘れましたか？</Link></div>
          <div><Link className="text-blue-600 hover:underline" to="/message/resend">認証メールの再送信</Link></div>
          <div><Link className="text-blue-600 hover:underline" to="/message/google">Googleでのログイン</Link></div>
          <div><Link className="text-blue-600 hover:underline" to="/message/line">LINEでのログイン</Link></div>
          <div><Link className="text-blue-600 hover:underline" to="/message/facebook">Facebookでのログイン</Link></div>
        </div>
      }
    >
      <form onSubmit={onLogin} className="space-y-4">
        <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="email"
            required
            placeholder="メールアドレス"
            className="w-full px-4 py-3 outline-none"
          />
          <div className="grid place-items-center border-l border-gray-300 bg-gray-50 px-4 text-gray-600">
            <MailIcon />
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            className="w-10/12 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            送信
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
