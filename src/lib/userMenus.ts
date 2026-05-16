// src/lib/userMenus.ts【新規作成】
// 受講生向けサイドバーのメニュー定義ファイル。
// コンポーネント内に直書きせず、ここで一元管理することで変更・追加が容易になる。

// メニュー項目の型定義
export type MenuItem = {
  label: string; // サイドバーに表示するテキスト
  to: string;    // リンク先のパス
};

// 受講生ダッシュボード共通メニュー（全ページで使いまわす）
export const dashboardMenu: MenuItem[] = [
  { label: "記事一覧", to: "/dashboard" },
  { label: "記事投稿", to: "/articles/new" },
  { label: "プロフィール一覧", to: "/profiles" },
  { label: "動画投稿一覧", to: "/videos" },
  { label: "つぶやき一覧", to: "/tweets" },
  { label: "問い合わせ", to: "/inquiries" },
];
