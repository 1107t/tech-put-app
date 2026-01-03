import { Link, useNavigate } from "react-router-dom";

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16v12H4z" />
      <path d="M4 8l8 5 8-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v10H6z" />
    </svg>
  );
}

export default function SignUpPage() {
  const navigate = useNavigate();

  const onSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("アカウント登録しました");
    navigate("/message/signup");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          {/* header */}
          <div className="border-b border-gray-200 px-6 py-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
              TecPutt
            </h1>
          </div>

          {/* body */}
          <div className="px-6 py-6">
            <p className="text-center text-gray-700">
              アカウント登録を行いましょう！
            </p>

            <form onSubmit={onSignup} className="mt-6 space-y-4">
              {/* name */}
              <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  required
                  placeholder="名前（フルネーム）"
                  className="w-full px-4 py-3 outline-none"
                />
                <div className="grid place-items-center border-l border-gray-300 bg-gray-50 px-4 text-gray-600">
                  <UserIcon />
                </div>
              </div>

              {/* email */}
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

              {/* password */}
              <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="password"
                  required
                  placeholder="パスワード"
                  className="w-full px-4 py-3 outline-none"
                />
                <div className="grid place-items-center border-l border-gray-300 bg-gray-50 px-4 text-gray-600">
                  <LockIcon />
                </div>
              </div>

              {/* password confirm */}
              <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="password"
                  required
                  placeholder="パスワード確認用"
                  className="w-full px-4 py-3 outline-none"
                />
                <div className="grid place-items-center border-l border-gray-300 bg-gray-50 px-4 text-gray-600">
                  <LockIcon />
                </div>
              </div>

              {/* agree */}
              <div className="flex justify-center">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    id="agree"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  利用規約に同意する
                </label>
              </div>

              {/* button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  className="w-10/12 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  登録
                </button>
              </div>
            </form>

            {/* link */}
            <div className="mt-6 text-sm">
              <Link className="text-blue-600 hover:underline" to="/login">
                ログイン
              </Link>
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
