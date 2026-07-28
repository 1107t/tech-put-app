// src/lib/tweets.ts【修正】
// つぶやき機能に関する型定義を管理するファイル。
// 画像は IndexedDB の Blob から Rails API の URL に変更したため imageUrls に変更した。

// コメント1件のデータ型
export type TweetComment = {
  id: string;       // UUID形式の一意なID
  content: string;  // コメント本文（APIレスポンスの content キーに対応）
  userId: string;   // 投稿者のユーザーID
  userName: string; // 投稿者のユーザー名（表示用）
  createdAt: string; // 投稿日時（ISO形式）
};

// つぶやき1件のデータ型
// - id: Rails が採番する整数IDを文字列に変換したもの
// - userId: 投稿したユーザーのID
// - userName: 投稿時点のユーザー名（一覧表示に使用）
// - content: つぶやき本文（DBカラム post をAPIがマッピングして返す）
// - imageUrls: 添付画像の絶対URL配列（Active Storage 経由）
// - likesCount: いいね数
// - likedByCurrentUser: ログイン中ユーザーがいいね済みかどうか（管理者ビューでは常に false）
// - comments: コメント一覧
export type Tweet = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrls?: string[];           // 添付画像URLの配列（省略可）
  likesCount?: number;            // いいね数（省略可）
  likedByCurrentUser?: boolean;   // いいね済みフラグ（省略可）
  comments?: TweetComment[];      // コメント一覧（省略可）
  createdAt: string;
  updatedAt?: string;
};
