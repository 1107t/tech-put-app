// src/lib/sort.ts
// 並べ替え順序の型と、createdAtによる比較関数を共通化するモジュール。
// 記事一覧（Index.tsx）・ユーザー一覧（AdminUsersPage.tsx）など、
// 複数の一覧画面で同じ並べ替え順序の概念とcreatedAt比較ロジックを使い回すために切り出す。

// 並べ替え順序として許容する値の一覧。型定義と実行時の検証の両方をここから導出する
export const SORT_ORDERS = ["asc", "desc"] as const;

// 並べ替え順序の型定義（昇順 or 降順）
export type SortOrder = (typeof SORT_ORDERS)[number];

// 任意の文字列がSortOrderかどうかを判定する型ガード。
// select等のDOM由来の値（string型）を型アサーションなしでSortOrderへ絞り込むために使う
export function isSortOrder(value: string): value is SortOrder {
  return (SORT_ORDERS as readonly string[]).includes(value);
}

// createdAtを持つオブジェクト同士をArray.prototype.sortで使える比較関数を返す。
// createdAtはDate.parseで数値（エポックミリ秒）に変換してから比較する。
// 文字列比較にすると "2026-07-31T21:53:13+09:00" と "2026-07-31T12:53:13Z" のように
// 同一時刻でも表記が異なる場合に誤った順序になるため、必ず時刻値として比較する。
export function compareByCreatedAt(
  order: SortOrder
): (itemA: { createdAt: string }, itemB: { createdAt: string }) => number {
  return (itemA, itemB) => {
    const timeA = Date.parse(itemA.createdAt);
    const timeB = Date.parse(itemB.createdAt);
    // 解析できない日付が含まれる場合は順序を変えない。
    // 比較関数がNaNを返すとソート結果が不定になるため、必ず数値を返す
    if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
    if (timeA < timeB) return order === "asc" ? -1 : 1;
    if (timeA > timeB) return order === "asc" ? 1 : -1;
    return 0;
  };
}
