export type MenuItem = {
  label: string;
  to: string;
};

export const dashboardMenu: MenuItem[] = [
  { label: "記事一覧", to: "/dashboard" },
  { label: "プロフィール一覧", to: "/profiles" },
  { label: "動画投稿一覧", to: "/videos" },
  { label: "つぶやき一覧", to: "/tweets" },
  { label: "問い合わせ", to: "/inquiries" },
];
