// src/lib/sort.ts【新規作成】
// 並べ替え順序の型と、createdAtによる比較関数を共通化するモジュール。
// 記事一覧（Index.tsx）・ユーザー一覧（AdminUsersPage.tsx）など、
// 複数の一覧画面で同じ並べ替え順序の概念とcreatedAt比較ロジックを使い回すために切り出す。

// 並べ替え順序として許容する値の一覧。型定義と実行時の検証の両方をここから導出する。
// 外部へは型・型ガード・選択肢だけを公開し、この配列自体はモジュール内に閉じる
const SORT_ORDERS = ["asc", "desc"] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

// 任意の文字列がSortOrderかどうかを判定する型ガード。
// select等のDOM由来の値（string型）を型アサーションなしでSortOrderへ絞り込むために使う
export function isSortOrder(value: string): value is SortOrder {
  return SORT_ORDERS.some((sortOrder) => sortOrder === value);
}

// 並べ替えの既定順序。モーダルの初期表示と一覧の初期並び順の両方がこの定数を参照する
// （本番Rails版で並べ替えパラメータなしのデフォルトがDESC=新しい順だったことに合わせている）
export const DEFAULT_SORT_ORDER: SortOrder = "desc";

// 並べ替え順セレクトの選択肢1件分の型。
// 基準（日時・名前など）ごとに選択肢の組を作れるよう、型だけを共通で公開する
export type SortOrderOption = { readonly value: SortOrder; readonly label: string };

// 日時を基準に並べる画面の選択肢。値とラベルの対応をここ1箇所で定義し、
// 一覧画面ごとに文言や値がずれることを防ぐ。
// ラベルも並べる順序（新しい順を先頭に置くか）も基準に依存するため、
// 日時以外を基準にする画面は、この定数を使い回さず基準ごとに1組ずつ定義すること
export const DATE_SORT_ORDER_OPTIONS: readonly SortOrderOption[] = [
  { value: "desc", label: "新しい順" },
  { value: "asc", label: "古い順" },
];

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
    // 解析できない日付は比較不能なため、順序によらず常に末尾へ送る。
    // 片方だけNaNのときに0（＝等価）を返すと比較関数が非推移的になり、
    // 不正な要素だけでなく正常な要素同士の並びまで実装依存で崩れる
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    if (timeA < timeB) return order === "asc" ? -1 : 1;
    if (timeA > timeB) return order === "asc" ? 1 : -1;
    return 0;
  };
}
