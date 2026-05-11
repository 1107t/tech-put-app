# コーディング規約 — React / TypeScript

このプロジェクト（tech-put-app）のコーディング規約。
レビューで指摘された内容を蓄積し、同じミスを繰り返さないためのルール集。

---

## 命名規則

### ① map / forEach のブロック変数は必ずフルネーム

**禁止:**
```tsx
lessons.map((l) => ...)       // NG: 1文字略語
users.map((u) => ...)         // NG
items.map((i) => ...)         // NG
```

**必須:**
```tsx
lessons.map((lesson) => ...)  // OK: フルネーム
users.map((user) => ...)      // OK
items.map((item) => ...)      // OK
```

**理由:** `l.title` では「なんのタイトルか」がわからない。`lesson.title` なら意図が明確になる。現場では命名の明確さが強く求められる。（西野さんレビュー 2026-05-08）

---

## スタイル規則

### ② インラインstyleは使わず、CSSクラスに一本化する

**禁止:**
```tsx
<div style={{ maxWidth: 640 }}>         // NG: 設計値をインラインに直書き
<textarea style={{ minHeight: 500 }}>   // NG: CSSクラスと二重定義
```

**必須:**
```css
/* dashboard.css */
.lesson-list { max-width: 640px; }

/* articlePost.css */
.article-editor-textarea { min-height: calc(100vh - 300px); }
```
```tsx
<div className="lesson-list">           // OK: CSSクラスで管理
<textarea className="article-editor-textarea">  // OK
```

**インラインで残してよい例外:**
- **動的な値**（stateやpropsで算出される値）→ その場合はCSS変数経由にする

```tsx
// 動的値はCSS変数経由で渡す
style={{ "--preview-height": `${editorHeight}px` } as React.CSSProperties}
```
```css
.article-preview-box { height: var(--preview-height, 500px); }
```

**理由:** 設計値（色・幅・高さ）はCSSで一元管理する。インラインとCSSの二重定義は混乱の元。（西野さんレビュー 2026-05-08）

---

---

## 設計原則

### ③ 同じ処理が2箇所以上あればカスタムフックや設定ファイルに切り出す（DRY原則）

**禁止:**
```tsx
// DashboardPage.tsx にも ArticlePostPage.tsx にも同じ認証コードを書く
useEffect(() => {
  (async () => {
    const u = await getCurrentUser();
    if (!u) { navigate("/login", { replace: true }); return; }
    setMe(u);
  })();
}, [navigate]);
```

**必須:**
```ts
// src/lib/useRequireAuth.ts に一度だけ書く
export function useRequireAuth(): User | null { ... }
```
```tsx
// 各ページは1行で済む
const me = useRequireAuth();
```

**判断基準:** 同じコードブロックが2ファイル以上に登場した時点で切り出しを検討する。

**理由:** ページが増えるたびに同じコードをコピーすると、修正が必要になったとき全ファイルを直す必要が生じる。（西野さんレビュー 2026-05-10）

---

### ④ データの定義とコンポーネントの表示ロジックは別ファイルに分ける（単一責任原則）

**禁止:**
```tsx
// UserSidebar.tsx の中にメニューデータを直書き
const menuItems = [
  { label: "記事一覧", to: "/dashboard" },
  { label: "プロフィール一覧", to: "/profiles" },
  ...
];
export default function UserSidebar() {
  // menuItems をそのまま使う
}
```

**必須:**
```ts
// src/lib/userMenus.ts にデータだけ定義
export const dashboardMenu: MenuItem[] = [
  { label: "記事一覧", to: "/dashboard" },
  ...
];
```
```tsx
// UserSidebar.tsx はpropsで受け取って表示するだけ
export default function UserSidebar({ items }: { items: MenuItem[] }) { ... }
```

**判断基準:** コンポーネントが「何を表示するか（データ）」と「どう表示するか（ロジック）」を両方持っていたら分離する。

**理由:** データをコンポーネント内に直書きすると、別バリアント（別メニューなど）が必要になったとき内部に条件分岐を足すしかなくなり、コンポーネントが肥大化する。（西野さんレビュー 2026-05-10）

---

## チェックリスト（コミット前に確認）

- [ ] `map` / `forEach` のブロック変数がフルネームになっているか
- [ ] インラインstyleが残っていないか（動的値はCSS変数経由か）
- [ ] CSSとインラインの二重定義になっていないか
- [ ] 同じ処理が複数ファイルに重複していないか（DRY原則）
- [ ] コンポーネントにデータ定義が直書きされていないか（SRP）
