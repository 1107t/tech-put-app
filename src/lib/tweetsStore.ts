// src/lib/tweetsStore.ts
// つぶやきデータのCRUD操作を行うストア。
// usersStore.ts と同じく localforage を使ってブラウザの IndexedDB に永続保存する。
import localforage from "localforage";
import type { Tweet } from "./tweets";

// usersStore と同じインスタンス設定を使用することで、同一DBの別ストアに保存される
const tweetStorage = localforage.createInstance({
  name: "tech-put-app",
  storeName: "app_storage",
});

// IndexedDB に保存する際のキー名
const TWEETS_KEY = "tweets";

// 全つぶやきを取得する（データがない場合は空配列を返す）
export async function getTweets(): Promise<Tweet[]> {
  return (await tweetStorage.getItem<Tweet[]>(TWEETS_KEY)) ?? [];
}

// 全つぶやきをストレージに保存するプライベート関数
async function setTweets(tweets: Tweet[]) {
  await tweetStorage.setItem(TWEETS_KEY, tweets);
}

// 新しいつぶやきを保存する。
// スプレッド構文で新しい配列を生成し、元の配列を変更しない（非破壊的操作）。
// 新しい投稿が一覧の先頭に来るよう tweet を配列の先頭に配置する。
export async function createTweet(tweet: Tweet): Promise<void> {
  const tweets = await getTweets();
  await setTweets([tweet, ...tweets]);
}

// 指定IDのつぶやきを削除する
export async function deleteTweet(id: string): Promise<void> {
  const tweets = await getTweets();
  await setTweets(tweets.filter((t) => t.id !== id));
}

// 指定IDのつぶやき本文を更新する
export async function updateTweet(id: string, content: string): Promise<void> {
  const tweets = await getTweets();
  await setTweets(tweets.map((t) => (t.id === id ? { ...t, content } : t)));
}
