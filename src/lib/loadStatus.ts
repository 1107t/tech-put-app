// ページの取得状態を区別し、読み込み中と失敗を同時に持たせない。
export type LoadStatus = "loading" | "loaded" | "failed"
