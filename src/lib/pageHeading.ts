// src/lib/pageHeading.ts【新規作成】
// 管理者側の「受講生◯◯一覧」ページ（記事 / 動画投稿 / つぶやき）の見出し文言を組み立てる共通ユーティリティ。

// 受講生別一覧ページの見出しを組み立てる。
// ユーザー情報の取得に失敗すると userName は空文字のままになり、そのまま連結すると
// 「さんの記事一覧」という宛先の無い見出しになってしまう（存在しないユーザーIDを開いたときに発生）。
// 名前が取れていないときは敬称ごと落として「受講生の記事一覧」と一般名で見せる。
//   userName: 受講生の氏名。取得できていない場合は空文字
//   listName: 一覧の種類を表す名詞（例: "記事一覧" / "動画投稿一覧" / "つぶやき一覧"）
export function buildUserPageHeading(userName: string, listName: string): string {
  if (!userName) return `受講生の${listName}`
  return `${userName}さんの${listName}`
}
