const DB_NAME = "tech-put-db";
const STORE_NAME = "articles";
const DB_VERSION = 1;

export type ArticleInput = {
  title: string;
  subtitle: string;
  body: string;
};

export type Article = ArticleInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function createArticle(data: ArticleInput): Promise<number> {
  const db = await openDb();
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).add({ ...data, createdAt: now, updatedAt: now });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllArticles(): Promise<Article[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const articles = req.result as Article[];
      resolve(
        [...articles].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getArticle(id: number): Promise<Article | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result as Article | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function updateArticle(id: number, data: ArticleInput): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result as Article | undefined;
      if (!existing) {
        reject(new Error("記事が見つかりません"));
        return;
      }
      const putReq = store.put({
        ...existing,
        ...data,
        id,
        updatedAt: new Date().toISOString(),
      });
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const SAMPLE_ARTICLES: Omit<Article, "id">[] = [
  { title: "システム開発とは", subtitle: "システム開発", body: "", createdAt: "2026-05-01T00:00:00.000Z", updatedAt: "2026-05-01T00:00:00.000Z" },
  { title: "HTML_CSS編(1) 簡単なホームページを作ってみよう。", subtitle: "HTML", body: "", createdAt: "2026-05-02T00:00:00.000Z", updatedAt: "2026-05-02T00:00:00.000Z" },
  { title: "HTML_CSS編(2) 簡単なホームページを作ってみよう。", subtitle: "CSS", body: "", createdAt: "2026-05-03T00:00:00.000Z", updatedAt: "2026-05-03T00:00:00.000Z" },
  { title: "HTML_CSS編(3) 簡単なホームページを作ってみよう。", subtitle: "HTML,CSS", body: "", createdAt: "2026-05-04T00:00:00.000Z", updatedAt: "2026-05-04T00:00:00.000Z" },
];

let seedPromise: Promise<void> | null = null;

export function seedSampleArticles(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const db = await openDb();
      const count = await new Promise<number>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (count > 0) return;
      for (const a of SAMPLE_ARTICLES) {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const req = tx.objectStore(STORE_NAME).add(a);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    })();
  }
  return seedPromise;
}
