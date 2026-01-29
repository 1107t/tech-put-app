import type React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

function BaseSvg({
  size = 18,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MailIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="M4 8l8 5 8-5" />
    </BaseSvg>
  );
}

export function LockIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v10H6z" />
    </BaseSvg>
  );
}

export function UserIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    </BaseSvg>
  );
}

// （必要なら後で）サイドバー用
export function GridIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v7h-7z" />
      <path d="M4 13h7v7H4z" />
      <path d="M13 13h7v7h-7z" />
    </BaseSvg>
  );
}

export function ListIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </BaseSvg>
  );
}

export function PlusSquareIcon({ size = 18, ...props }: IconProps) {
  return (
    <BaseSvg size={size} {...props}>
      <path d="M3 3h18v18H3z" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </BaseSvg>
  );
}
