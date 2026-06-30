# 教訓まとめ

## `??` / `||` のフォールバック値は安全か確認する（2026-06-16）

- `getArticle(id ?? "")` という書き方をセルフレビューで見逃した
- `id` が `undefined` のとき空文字が渡り、`/articles/` という無効なAPIリクエストが飛ぶ問題があった
- tetuさんのレビューで初めて気づいた

**教訓:**
`??` や `||` を書いた時点で「なぜnull/undefinedになり得るのか」「フォールバック値を渡して安全か」を必ず確認する。
安全でない場合は早期リターンで処理を止める。

```typescript
// NG
const data = await getArticle(id ?? "");

// OK
if (!id) { navigate("/articles"); return; }
const data = await getArticle(id);
```

## セルフレビューはコミット・プッシュ前に必ず行う（2026-06-16）

- PR#287（capybara.rb修正）でコミット・プッシュ後にセルフレビューを行った
- 本来の順番: 修正 → セルフレビュー → コミット → プッシュ → コメント投稿

## `error` stateの二重使用によるページ消滅バグ（2026-06-30）

- 読み込みエラーと操作エラー（削除・更新）を同じ `error` state で管理していた
- ページ上部に `if (error) return <エラーページ>` があるため、操作エラー時にもページが消えてしまった
- Edit.tsx と Show.tsx の2ファイルで同じパターンのバグが存在し、セルフレビューを3回繰り返してようやく全件発見できた

**教訓:**
API連携ページの `error` state は役割で必ず2種類に分ける：

```typescript
const [loadError, setLoadError] = useState(""); // 読み込み時エラー → エラーページを表示
const [error, setError] = useState("");          // 操作時エラー → ページを残してインラインに表示

// useEffect内（読み込み）
} catch {
  setLoadError("読み込みに失敗しました。");
}

// handleDelete / handleUpdate内（操作）
} catch (err) {
  setError(getApiErrorMessage(err, "削除に失敗しました。"));
}

// レンダリング
if (loadError) return <エラーページ>      // 読み込みエラーのみここで止める
{error && <p className="text-danger">{error}</p>}  // 操作エラーはインライン表示
```

また、`if (loadError) return` を追加した後は、本体内の `{error && ...}` が到達可能かを必ず確認する。到達不能なデッドコードになっていることがある。

## Rails API連携時はバックエンドの要求フィールドと照合する（2026-06-30）

- `adminApi.ts` の送信データを「書かれているもの」として確認したが、「Railsが要求しているのに送っていないもの」の欠如に気づけなかった
- Rails側の `validates :article_type, presence: true` が存在したが、フロントが `article_type` を送っていないことをレビューで検出できなかった
- 実際に投稿操作をして初めて発覚した

**教訓:**
Rails API連携のあるAPI関数をレビューするときは、必ずRails側と照合する：

| Rails側 | フロント側 | 確認内容 |
|--------|-----------|---------|
| `params.permit(:title, :sub_title, :content, :article_type)` | `api.post('/admin/articles', { title, sub_title, content })` | 許可フィールドが全て送られているか |
| `validates :article_type, presence: true, if: ...` | `article_type: data.articleType` | 必須バリデーションのあるフィールドが送られているか |

コードの静的確認だけでなく、**実際にAPIを叩いて動作確認することが最終的な担保**になる。

## 操作失敗時はUI状態もリセットする（2026-06-30）

- 削除の catch ブロックでエラーメッセージを表示したが、ドロップダウンメニューを閉じていなかった
- 削除失敗後もメニューが開いたままになるUIバグが発生した

**教訓:**
操作の `catch` ブロックでは、エラー表示だけでなく **UIの状態リセットも忘れずに行う**。

```typescript
} catch (err) {
  setOpenMenuId(null);  // ← UIリセット（ドロップダウン・モーダル等）
  setError(getApiErrorMessage(err, "削除に失敗しました。"));
}
```
