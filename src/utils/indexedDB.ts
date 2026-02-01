// データベース名とストア名
const DB_NAME = 'TechPutDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

// データベースの初期化
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        objectStore.createIndex('email', 'email', { unique: true });
      }
    };
  });
};

// ユーザーデータの型定義
export interface UserData {
  id?: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// ユーザー登録
export const addUser = async (userData: Omit<UserData, 'id'>): Promise<number> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(userData);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

// メールアドレスでユーザーを検索
export const getUserByEmail = async (email: string): Promise<UserData | undefined> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('email');
    const request = index.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 全ユーザーを取得
export const getAllUsers = async (): Promise<UserData[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ユーザー認証（ログイン用）
export const authenticateUser = async (
  email: string, 
  password: string
): Promise<UserData | null> => {
  const user = await getUserByEmail(email);
  
  if (user && user.password === password) {
    return user;
  }
  
  return null;
};