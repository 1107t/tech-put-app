// src/lib/tweetsStore.ts【修正】
// つぶやきデータのCRUD操作を行うストア。
// usersStore.ts と同じく localforage を使ってブラウザの IndexedDB に永続保存する。
import localforage from "localforage";
import type { Tweet, TweetComment } from "./tweets";

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

// いいね数を1増やす
export async function likeTweet(id: string): Promise<void> {
  const tweets = await getTweets();
  await setTweets(
    tweets.map((tweet) =>
      tweet.id === id ? { ...tweet, likes: (tweet.likes ?? 0) + 1 } : tweet
    )
  );
}

// いいね数を1減らす（0未満にはならない）
export async function unlikeTweet(id: string): Promise<void> {
  const tweets = await getTweets();
  await setTweets(
    tweets.map((tweet) =>
      tweet.id === id ? { ...tweet, likes: Math.max(0, (tweet.likes ?? 0) - 1) } : tweet
    )
  );
}

// 指定ツイートにコメントを追加する
export async function addComment(tweetId: string, text: string): Promise<void> {
  const tweets = await getTweets();
  const newComment: TweetComment = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
  await setTweets(
    tweets.map((tweet) =>
      tweet.id === tweetId
        ? { ...tweet, comments: [...(tweet.comments ?? []), newComment] }
        : tweet
    )
  );
}
