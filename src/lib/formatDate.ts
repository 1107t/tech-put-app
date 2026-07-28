// src/lib/formatDate.ts【新規作成】
// ISO形式の日時文字列を「YYYY年MM月DD日 HH:mm」形式に変換する共通ユーティリティ。
// users/tweet/Index.tsx と admins/AdminUserTweetsPage.tsx で重複していた実装を切り出した。
export function formatDate(iso: string): string {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0") // 月は0始まりのため+1
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}
