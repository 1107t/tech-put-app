// src/components/HeaderBar.tsx
import { useState } from "react";
import { AvatarIcon } from "./Icons";

type Props = {
  onMyPage: () => void;
  onDashboard: () => void;
  onLogout: () => void;
  title?: string;
};

export default function HeaderBar({
  onMyPage,
  onDashboard,
  onLogout,
  title = "投稿した記事一覧",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
      <h1 className="h5 mb-0">{title}</h1>

      <div className="position-relative">
        <button
          className="btn p-0 border-0 bg-transparent"
          onClick={() => setOpen(!open)}
        >
          <AvatarIcon size={42} />
        </button>

        {open && (
          <div className="dropdown-menu show position-absolute end-0 mt-2">
            <button className="dropdown-item" onClick={onMyPage}>
              マイページ
            </button>
            <button className="dropdown-item" onClick={onDashboard}>
              ダッシュボード
            </button>
            <button className="dropdown-item text-danger" onClick={onLogout}>
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
