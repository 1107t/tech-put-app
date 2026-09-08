// src/lib/loadStatus.ts【新規作成】
// ページ全体の読み込み状態を表す共通の型。
// boolean を2つ（loading / loadFailed）持つと "読み込み中かつ失敗" という起こり得ない組み合わせが
// 型の上で表現できてしまい、描画側が失敗の分岐を書き忘れても気づけない。
// 3つの値を持つ1つの型にまとめることで、失敗の表示漏れをコンパイル時に見つけやすくする。

// loading=取得中 / loaded=取得成功 / failed=取得失敗
export type LoadStatus = "loading" | "loaded" | "failed"
