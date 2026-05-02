// src/components/AuthLayout.tsx
// ログイン・新規登録・パスワードリセットなど認証系ページの共通レイアウト。
// ロゴ・サブタイトル・メインコンテンツ・フッターリンクを統一的に表示する。
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// このレイアウトが受け取るプロパティの型定義
type Props = {
  subtitle?: string;
  brandHref?: string; // "/login" など
  children: ReactNode;
  footer?: ReactNode;
};

// 認証系ページ共通レイアウトコンポーネント。ロゴ・カード・フッターを描画する。
export default function AuthLayout({
  subtitle,
  brandHref = "/login",
  children,
  footer,
}: Props) {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <Link to={brandHref} className="text-decoration-none">
                    <div className="fw-bold fs-4 text-dark">TECH-PUT</div>
                  </Link>
                  {subtitle ? (
                    <div className="text-muted small mt-1">{subtitle}</div>
                  ) : null}
                </div>

                {children}

                {footer ? (
                  <>
                    <hr className="my-4" />
                    <div className="small">{footer}</div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="text-center text-muted small mt-3">
              © {new Date().getFullYear()} TECH-PUT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
