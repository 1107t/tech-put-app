// src/lib/usersStore.ts
// 一般ユーザーのCRUD操作・ログイン・セッション管理を行うストア。
// localforageを使ってブラウザに永続保存する（学習用のシンプルな実装）。
import localforage from "localforage";
import type { User } from "./users";

// ユーザーデータを保存するlocalforageインスタンス
const userStorage = localforage.createInstance({
  name: "tech-put-app",
  storeName: "app_storage",
});

// ストレージのキー定数。usersは全ユーザーの配列、currentUserIdはログイン中のユーザーIDを保持
const USERS_KEY = "users";
const CURRENT_USER_ID_KEY = "currentUserId";

// 全ユーザーを取得する（データがない場合は空配列を返す）
export async function getUsers(): Promise<User[]> {
  return (await userStorage.getItem<User[]>(USERS_KEY)) ?? [];
}

// 全ユーザーをストレージに保存するプライベート関数
async function setUsers(users: User[]) {
  await userStorage.setItem(USERS_KEY, users);
}

// 新規ユーザーを登録する（メールアドレスの重複チェックあり）
export async function createUser(newUser: User) {
  const users = await getUsers();

  // 大文字小文字を区別せずメールアドレスの重複を確認する
  const exists = users.some(
    (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
  );
  if (exists) throw new Error("そのメールアドレスは既に登録されています。");

  users.push(newUser);
  await setUsers(users);
}

// メールアドレスでユーザーを検索する（見つからない場合はnullを返す）
export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

// IDでユーザーを検索する（見つからない場合はnullを返す）
export async function findUserById(id: string) {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

// ログイン処理：メール・パスワードを照合し、成功したらセッションにIDを保存する
export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error("メールアドレスまたはパスワードが違います。");
  }
  await userStorage.setItem(CURRENT_USER_ID_KEY, user.id);
  return user;
}

// ログアウト処理：セッションからユーザーIDを削除する
export async function logout() {
  await userStorage.removeItem(CURRENT_USER_ID_KEY);
}

// セッションに保存されているログイン中のユーザーIDを取得する
export async function getCurrentUserId(): Promise<string | null> {
  return (await userStorage.getItem<string>(CURRENT_USER_ID_KEY)) ?? null;
}

// ログイン中のユーザー情報を取得する（未ログイン時はnullを返す）
export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return await findUserById(id);
}