// 受講生別の記事・動画投稿一覧の見出しを組み立てる。
export function buildUserPageHeading(userName: string, listName: string): string {
  // 氏名が空のときに「さんの一覧」だけが表示されるのを避ける。
  if (!userName) return `受講生の${listName}`
  return `${userName}さんの${listName}`
}
