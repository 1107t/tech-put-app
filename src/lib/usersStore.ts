// src/lib/usersStore.ts
import localforage from "localforage";
import type { User } from "./users";

const userStorage = localforage.createInstance({
  name: "tech-put-app",
  storeName: "app_storage",
});

const USERS_KEY = "users";
const CURRENT_USER_ID_KEY = "currentUserId";

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

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error("メールアドレスまたはパスワードが違います。");
  }
  await userStorage.setItem(CURRENT_USER_ID_KEY, user.id);
  return user;
}
export async function logout() {
  await userStorage.removeItem(CURRENT_USER_ID_KEY);
}

export async function getCurrentUserId(): Promise<string | null> {
  return (await userStorage.getItem<string>(CURRENT_USER_ID_KEY)) ?? null;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return await findUserById(id);
}