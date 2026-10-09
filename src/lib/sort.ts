// 並べ替え順序の型と、一覧画面が共通で使う比較関数を提供する。

// 並べ替え順序として許容する値の一覧。型定義と実行時の検証の両方をここから導出する。
// 外部へは型・型ガード・選択肢だけを公開し、この配列自体はモジュール内に閉じる
const SORT_ORDERS = ["asc", "desc"] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

// 任意の文字列がSortOrderかどうかを判定する型ガード。
// select等のDOM由来の値（string型）を型アサーションなしでSortOrderへ絞り込むために使う。
// 想定外の値は黙って捨てられるため、選択肢を増やすときはSORT_ORDERSにも必ず追加すること
export function isSortOrder(value: string): value is SortOrder {
  return SORT_ORDERS.some((sortOrder) => sortOrder === value);
}

// 並べ替えの既定順序。モーダルの初期表示と一覧の初期並び順の両方がこの定数を参照する
// （本番Rails版で並べ替えパラメータなしのデフォルトがDESC=新しい順だったことに合わせている）
export const DEFAULT_SORT_ORDER: SortOrder = "desc";

// 並べ替え順セレクトの選択肢1件分の型。
// 基準（日時・名前など）ごとに選択肢の組を作れるよう、型だけを共通で公開する
export type SortOrderOption = { readonly value: SortOrder; readonly label: string };

// 日時を基準に並べる画面のラベル。SortOrderをキーにしたRecordにすることで、
// 順序を増やしたときにラベルの追加漏れがコンパイルエラーになる。
// ラベルも並べる順序（新しい順を先頭に置くか）も基準に依存するため、
// 日時以外を基準にする画面は、この定数を使い回さず基準ごとに1組ずつ定義すること
export const DATE_SORT_ORDER_LABELS: Record<SortOrder, string> = {
  desc: "新しい順",
  asc: "古い順",
};

// 日時を基準に並べる画面のセレクト選択肢。ラベルは上の定数から引くため二重定義にならない
export const DATE_SORT_ORDER_OPTIONS: readonly SortOrderOption[] = [
  { value: "desc", label: DATE_SORT_ORDER_LABELS.desc },
  { value: "asc", label: DATE_SORT_ORDER_LABELS.asc },
];

// createdAtの比較関数を作る。オフセット表記が異なるISO 8601は辞書順と時系列順が一致しないため、
// Date.parseで時刻値に直してから比較する
export function createCreatedAtComparator(
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

// nameを持つオブジェクト同士をArray.prototype.sortで比較する関数を作る。
// localeCompareに"ja"を渡すことで、ひらがな・カタカナ・漢字を五十音順に並べる。
// createdAt側と対で置くことで、基準が増えたときにどちらに倣うかが決まる
export function createNameComparator(
  order: SortOrder
): (itemA: { name: string }, itemB: { name: string }) => number {
  return (itemA, itemB) => {
    const compared = itemA.name.localeCompare(itemB.name, "ja");
    return order === "asc" ? compared : -compared;
  };
}
