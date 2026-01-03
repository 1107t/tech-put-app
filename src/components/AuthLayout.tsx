import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  brandHref?: string;
};

export default function AuthLayout({
  title = "TecPutt",
  subtitle,
  children,
  footer,
  brandHref = "/login",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          {/* header */}
          <div className="border-b border-gray-200 px-6 py-6 text-center">
            <Link to={brandHref} className="inline-block">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
                {title}
              </h1>
            </Link>
          </div>

          {/* body */}
          <div className="px-6 py-6">
            {subtitle ? (
              <p className="text-center text-gray-700">{subtitle}</p>
            ) : null}

            <div className={subtitle ? "mt-6" : ""}>{children}</div>

            {footer ? <div className="mt-6 text-sm">{footer}</div> : null}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
