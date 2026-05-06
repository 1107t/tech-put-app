import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/usersStore";
import type { User } from "../../lib/users";

export default function ArticlePostPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [editorHeight, setEditorHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const observer = new ResizeObserver(() => {
      setEditorHeight(textarea.offsetHeight);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [me]);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(u);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = () => {
    console.log("記事投稿:", { title, subtitle, body });
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!me) return null;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="text-white p-3" style={{ width: 260, flexShrink: 0, background: "#1f2937" }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="rounded-circle bg-secondary" style={{ width: 28, height: 28 }} />
          <div className="fw-bold">TecPutt</div>
        </div>

        <div className="small text-uppercase text-white-50 mb-2">e-learning</div>

        <nav className="d-grid gap-1">
          <Link className="btn btn-sm btn-dark text-start" to="/dashboard">
            記事一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/profiles">
            プロフィール一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/videos">
            動画投稿一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/tweets">
            つぶやき一覧
          </Link>
          <Link className="btn btn-sm btn-dark text-start" to="/inquiries">
            問い合わせ
          </Link>
        </nav>

        <button className="btn btn-light w-100 mt-3" onClick={handleLogout}>
          ログアウト
        </button>
      </aside>

      {/* Main */}
      <main className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <span>≡ 投稿した記事一覧</span>
          <div className="rounded-circle bg-secondary" style={{ width: 28, height: 28 }} title="user" />
        </div>

        {/* Form */}
        <div className="p-4">
          <h2 className="h5 mb-4">記事投稿</h2>

          <div className="mb-3">
            <input
              type="text"
              className="form-control border-0 border-bottom rounded-0 bg-transparent"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              className="form-control border-0 border-bottom rounded-0 bg-transparent"
              placeholder="サブタイトル"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* Editor / Preview split */}
          <div className="d-flex gap-3 mb-4">
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="fw-semibold mb-1 small border-bottom pb-1">エディター</div>
              <textarea
                ref={textareaRef}
                className="form-control"
                placeholder="本文"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ resize: "vertical", minHeight: "calc(100vh - 300px)" }}
              />
            </div>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="fw-semibold mb-1 small border-bottom pb-1">プレビュー</div>
              <div
                className="border p-2 bg-white"
                style={{
                  height: editorHeight ?? "calc(100vh - 300px)",
                  minHeight: "calc(100vh - 300px)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  overflow: "auto",
                }}
              >
                {body}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-primary" onClick={handleSubmit}>
              投稿
            </button>
            <button className="btn btn-outline-secondary" onClick={handleCancel}>
              キャンセル
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
