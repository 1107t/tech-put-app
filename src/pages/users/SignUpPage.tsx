import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { v4 as uuid } from "uuid";
import { UserIcon, MailIcon, LockIcon } from "../../components/Icons";
import { createUser, login } from "../../lib/usersStore";
import { Gender, type GenderValue } from "../../lib/users";


export default function SignUpPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<GenderValue>(Gender.Unset);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agree, setAgree] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setMsg(null);

    if (!agree) return setMsg("利用規約に同意してください。");
    if (!name || !email || !birthday || !password || !password2) {
      return setMsg("未入力の項目があります。");
    }
    if (password !== password2) return setMsg("パスワード確認が一致しません。");

    try {
      setSaving(true);

      await createUser({
        id: uuid(),
        name,
        email,
        birthday,
        gender,
        password, // 学習用（本番NG）
        createdAt: new Date().toISOString(),
      });

      // 登録後にログイン扱いにしたいなら（任意）
      await login(email, password);

      navigate("/message/signup", { replace: true });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "登録に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      subtitle="アカウント登録を行いましょう！"
      brandHref="/signup"
      footer={
        <div className="text-center">
          <Link className="link-primary text-decoration-none" to="/login">
            ログインへ戻る
          </Link>
        </div>
      }
    >
      {msg && (
        <div className="alert alert-danger py-2 mb-0" role="alert">
          {msg}
        </div>
      )}

      <form onSubmit={onSignup} className="d-grid gap-3">
        <div>
          <label className="form-label fw-semibold">名前（フルネーム）</label>
          <div className="input-group">
            <input
              type="text"
              required
              className="form-control"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            <span className="input-group-text text-muted">
              <UserIcon />
            </span>
          </div>
        </div>

        <div>
          <label className="form-label fw-semibold">メールアドレス</label>
          <div className="input-group">
            <input
              type="email"
              required
              className="form-control"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
            <span className="input-group-text text-muted">
              <MailIcon />
            </span>
          </div>
        </div>

        <div>
          <label className="form-label fw-semibold">生年月日</label>
          <input
            type="date"
            required
            className="form-control"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="form-label fw-semibold">性別</label>
          <select
            className="form-select"
            value={gender}
            onChange={(e) => setGender(Number(e.target.value) as GenderValue)}
            disabled={saving}
          >
            <option value={Gender.Unset}>未設定</option>
            <option value={Gender.Male}>男性</option>
            <option value={Gender.Female}>女性</option>
          </select>
        </div>

        <div>
          <label className="form-label fw-semibold">パスワード</label>
          <div className="input-group">
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving}
            />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        <div>
          <label className="form-label fw-semibold">パスワード（確認用）</label>
          <div className="input-group">
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={saving}
            />
            <span className="input-group-text text-muted">
              <LockIcon />
            </span>
          </div>
        </div>

        <div className="form-check d-flex justify-content-center">
          <input
            id="agree"
            type="checkbox"
            className="form-check-input"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            disabled={saving}
          />
          <label htmlFor="agree" className="form-check-label fw-semibold ms-2">
            利用規約に同意する
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          disabled={!agree || saving}
        >
          {saving ? "登録中..." : "アカウント登録"}
        </button>
      </form>
    </AuthLayout>
  );
}
