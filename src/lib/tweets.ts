// src/lib/tweets.ts【修正】
// つぶやき機能に関する型定義を管理するファイル。

// コメント1件のデータ型
export type TweetComment = {
  id: string;        // UUID形式の一意なID
  text: string;      // コメント本文
  createdAt: string; // 投稿日時（ISO形式）
};

// つぶやき1件のデータ型
// - id: UUID形式の一意なID（投稿時に生成）
// - userId: 投稿したユーザーのID（usersテーブルの外部キー相当）
// - userName: 投稿時点のユーザー名（一覧表示に使用）
// - content: つぶやき本文
// - images: 添付画像（0〜N枚）。Blob形式でそのまま保存することでbase64より容量を抑える
// - createdAt: 投稿日時（ISO形式の日時文字列）
// - likes: いいね数（省略時は0）
// - comments: コメント一覧（省略時は空）
export type Tweet = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  images?: Blob[];           // 添付画像（省略可・複数枚対応）
  createdAt: string;
  likes?: number;            // いいね数（省略可）
  comments?: TweetComment[]; // コメント一覧（省略可）
};
