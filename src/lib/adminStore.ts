// src/lib/adminStore.ts
import localforage from "localforage";
import bcrypt from "bcryptjs";

// ストレージキー定数（id基準で管理し、メール変更時の不整合を防ぐ）
export const ADMIN_KEY_PREFIX = "admin:";        // admin:{adminId} -> Admin
export const EMAIL_INDEX_PREFIX = "email:";      // email:{email}   -> adminId
export const SESSION_ADMIN_ID_KEY = "admin_id";  // session: current admin id

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

// メールアドレスからadminIdを取得
async function getAdminIdByEmail(email: string): Promise<string | null> {
  return await adminStorage.getItem<string>(EMAIL_INDEX_PREFIX + email);
}

// adminIdから管理者情報を取得
async function getAdminById(adminId: string): Promise<Admin | null> {
  return await adminStorage.getItem<Admin>(ADMIN_KEY_PREFIX + adminId);
}

// 管理者登録
export async function registerAdmin(
  email: string,
  password: string,
  name: string
): Promise<Admin> {
  // メールアドレスの重複チェック
  const existingAdminId = await getAdminIdByEmail(email);
  if (existingAdminId) {
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

  // 管理者データを保存（IDベース）
  await adminStorage.setItem(ADMIN_KEY_PREFIX + newAdmin.id, newAdmin);
  
  // メールアドレスからIDを引けるようにインデックスを保存
  await adminStorage.setItem(EMAIL_INDEX_PREFIX + email, newAdmin.id);

  return newAdmin;
}

// 管理者ログイン
export async function adminLogin(
  email: string,
  password: string
): Promise<Admin> {
  // メールアドレスからIDを取得
  const adminId = await getAdminIdByEmail(email);
  if (!adminId) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  // IDから管理者情報を取得
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  // パスワードの検証
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error("メールアドレスまたはパスワードが正しくありません。");
  }

  // セッションに管理者IDのみを保存
  await adminSessionStorage.setItem(SESSION_ADMIN_ID_KEY, admin.id);

  return admin;
}

// 現在ログイン中の管理者IDを取得
export async function getCurrentAdminId(): Promise<string | null> {
  return await adminSessionStorage.getItem<string>(SESSION_ADMIN_ID_KEY);
}

// 現在ログイン中の管理者情報を取得
export async function getCurrentAdmin(): Promise<Admin | null> {
  const adminId = await getCurrentAdminId();
  if (!adminId) return null;

  return await getAdminById(adminId);
}

// 管理者ログアウト
export async function adminLogout(): Promise<void> {
  await adminSessionStorage.removeItem(SESSION_ADMIN_ID_KEY);
}

// 管理者情報の更新
export async function updateAdmin(
  adminId: string,
  updates: Partial<Omit<Admin, "id" | "createdAt">>
): Promise<Admin> {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new Error("管理者が見つかりません。");
  }

  // メールアドレスが変更される場合
  if (updates.email && updates.email !== admin.email) {
    // 新しいメールアドレスの重複チェック
    const existingAdminId = await getAdminIdByEmail(updates.email);
    if (existingAdminId && existingAdminId !== adminId) {
      throw new Error("このメールアドレスは既に使用されています。");
    }

    // 古いメールのインデックスを削除
    await adminStorage.removeItem(EMAIL_INDEX_PREFIX + admin.email);
    
    // 新しいメールのインデックスを作成
    await adminStorage.setItem(EMAIL_INDEX_PREFIX + updates.email, adminId);
  }

  const updatedAdmin: Admin = {
    ...admin,
    ...updates,
  };

  // 管理者データを更新
  await adminStorage.setItem(ADMIN_KEY_PREFIX + adminId, updatedAdmin);
  
  return updatedAdmin;
}

// パスワード変更（adminIdを使用）
export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const admin = await getAdminById(adminId);
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

  // adminIdを使用して更新
  await updateAdmin(adminId, { password: hashedPassword });
}

// 管理者削除
export async function deleteAdmin(adminId: string): Promise<void> {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new Error("管理者が見つかりません。");
  }

  // 管理者データを削除
  await adminStorage.removeItem(ADMIN_KEY_PREFIX + adminId);
  
  // メールインデックスも削除
  await adminStorage.removeItem(EMAIL_INDEX_PREFIX + admin.email);
}

// 全管理者を取得（開発・デバッグ用）
export async function getAllAdmins(): Promise<Admin[]> {
  const admins: Admin[] = [];
  
  await adminStorage.iterate<Admin | string, void>((value, key) => {
    // admin:{id} のキーのみを対象とする
    if (key.startsWith(ADMIN_KEY_PREFIX)) {
      admins.push(value as Admin);
    }
  });
  
  return admins;
}