// src/lib/users.ts
// ユーザーに関する型定義・定数・ユーティリティ関数を管理するファイル。
// GenderはUnset/Male/Femaleの3値を持つ列挙的なオブジェクトとして定義している。

// 性別を表す定数オブジェクト（0:未設定, 1:男性, 2:女性）
export const Gender = {
  Unset: 0,
  Male: 1,
  Female: 2,
} as const;

// GenderオブジェクトのValueの型（0 | 1 | 2）を型として抽出する
export type GenderValue = (typeof Gender)[keyof typeof Gender];

// 性別の数値を日本語ラベルに変換するユーティリティ関数
export const genderLabel = (v: GenderValue) => {
  switch (v) {
    case Gender.Male:
      return "男性";
    case Gender.Female:
      return "女性";
    default:
      return "未設定";
  }
};

// ユーザーデータの型定義（アプリ全体でこの型を使用する）
export type User = {
  id: string;       // UUID形式の一意なID
  name: string;
  email: string;
  birthday: string; // ISO形式の日付文字列（例: "2000-01-01"）
  gender: GenderValue;
  password: string; // 学習用（本番環境ではハッシュ化が必須）
  createdAt: string; // ISO形式の日時文字列
};
