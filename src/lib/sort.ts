// src/lib/sort.ts
// 並べ替え順序の型と、createdAtによる比較関数を共通化するモジュール。
// 記事一覧（Index.tsx）・ユーザー一覧（AdminUsersPage.tsx）など、
// 複数の一覧画面で同じ並べ替え順序の概念とcreatedAt比較ロジックを使い回すために切り出す。

// 並べ替え順序の型定義（昇順 or 降順）
export type SortOrder = "asc" | "desc";

// createdAtを持つオブジェクト同士をArray.prototype.sortで使える比較関数を返す。
// createdAtはISO 8601形式の文字列を想定しており、文字列比較でそのまま時系列順になる。
export function compareByCreatedAt(
  order: SortOrder
): (itemA: { createdAt: string }, itemB: { createdAt: string }) => number {
  return (itemA, itemB) => {
    if (itemA.createdAt < itemB.createdAt) return order === "asc" ? -1 : 1;
    if (itemA.createdAt > itemB.createdAt) return order === "asc" ? 1 : -1;
    return 0;
  };
}
