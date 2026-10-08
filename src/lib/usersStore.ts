// src/lib/usersStore.ts
import localforage from "localforage";
import type { User, AuthUser } from "./users";
import { apiFetch, ApiError } from "./api";

const userStorage = localforage.createInstance({
  name: "tech-put-app",
  storeName: "app_storage",
});

const USERS_KEY = "users";

export async function getUsers(): Promise<User[]> {
  return (await userStorage.getItem<User[]>(USERS_KEY)) ?? [];
}

async function setUsers(users: User[]) {
  await userStorage.setItem(USERS_KEY, users);
}

export async function createUser(newUser: User) {
  const users = await getUsers();

  const exists = users.some(
    (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
  );
  if (exists) throw new Error("そのメールアドレスは既に登録されています。");

  users.push(newUser);
  await setUsers(users);
}

export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

export async function findUserById(id: string) {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

// ログイン・ログアウト・現在ユーザー取得はRailsのセッションCookieに一本化する。
// クライアント側では何も保存せず、Cookieの送受信はブラウザに任せる。
export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function logout() {
  await apiFetch<void>("/logout", { method: "DELETE" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ user: AuthUser }>("/me");
    return data.user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}