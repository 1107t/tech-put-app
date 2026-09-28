export function formatDate(iso: string): string {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0") // 月は0始まりのため+1
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

// 既存の動画一覧に合わせ、動画の投稿日は時刻を含まない日本語の日付表記にする。
export function formatVideoDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP")
}
