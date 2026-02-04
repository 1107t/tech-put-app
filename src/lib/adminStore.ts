// src/lib/adminStore.ts
import localforage from "localforage";
import bcrypt from "bcryptjs";

// 管理者用のストレージインスタンス
const adminStorage = localforage.createInstance({
  name: "tech-put-admin",
  storeName: "admins",
});

const adminSessionStorage = localforage.createInstance({
  name: "tech-put-admin",
  storeName: "session",
});

// 管理者の型定義
export interface Admin {
  id: string;
  email: string;
  password: string; // ハッシュ化されたパスワード
  name: string;
  createdAt: string;
}

// 管理者登録
export async function registerAdmin(
  email: string,
  password: string,
  name: string
): Promise<Admin> {
  // メールアドレスの重複チェック
  const existingAdmin = await adminStorage.getItem<Admin>(email);
  if (existingAdmin) {
    throw new Error("このメールアドレスは既に登録されています。");
  }

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin: Admin = {
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
  };

  await adminStorage.setItem(email, newAdmin);
  return newAdmin;
}

// 管理者ログイン
export async function adminLogin(
  email: string,
  password: string
): Promise<Admin> {
  const admin = await adminStorage.getItem<Admin>(email);

  if (!admin) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  // パスワードの検証
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  // セッションに管理者IDを保存
  await adminSessionStorage.setItem("admin_id", admin.id);
  await adminSessionStorage.setItem("admin_email", admin.email);

  return admin;
}

// 現在ログイン中の管理者IDを取得
export async function getCurrentAdminId(): Promise<string | null> {
  return await adminSessionStorage.getItem<string>("admin_id");
}

// 現在ログイン中の管理者情報を取得
export async function getCurrentAdmin(): Promise<Admin | null> {
  const adminId = await getCurrentAdminId();
  if (!adminId) return null;

  const email = await adminSessionStorage.getItem<string>("admin_email");
  if (!email) return null;

  return await adminStorage.getItem<Admin>(email);
}

// 管理者ログアウト
export async function adminLogout(): Promise<void> {
  await adminSessionStorage.removeItem("admin_id");
  await adminSessionStorage.removeItem("admin_email");
}

// 管理者情報の更新
export async function updateAdmin(
  email: string,
  updates: Partial<Omit<Admin, "id" | "email" | "createdAt">>
): Promise<Admin> {
  const admin = await adminStorage.getItem<Admin>(email);
  if (!admin) {
    throw new Error("管理者が見つかりません。");
  }

  const updatedAdmin: Admin = {
    ...admin,
    ...updates,
  };

  await adminStorage.setItem(email, updatedAdmin);
  return updatedAdmin;
}

// パスワード変更
export async function changeAdminPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const admin = await adminStorage.getItem<Admin>(email);
  if (!admin) {
    throw new Error("管理者が見つかりません。");
  }

  // 現在のパスワードを確認
  const isValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isValid) {
    throw new Error("現在のパスワードが正しくありません。");
  }

  // 新しいパスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateAdmin(email, { password: hashedPassword });
}

// 管理者削除
export async function deleteAdmin(email: string): Promise<void> {
  await adminStorage.removeItem(email);
}

// 全管理者を取得（開発・デバッグ用）
export async function getAllAdmins(): Promise<Admin[]> {
  const admins: Admin[] = [];
  await adminStorage.iterate<Admin, void>((value) => {
    admins.push(value);
  });
  return admins;
}