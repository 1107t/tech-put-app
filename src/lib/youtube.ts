// src/lib/youtube.ts【新規作成】
// YouTube の動画URLから動画IDを取り出すユーティリティ。
// サムネイル画像URL（https://img.youtube.com/vi/<動画ID>/mqdefault.jpg）の組み立てに使う。
//
// origin/main の同名ファイルからの移植で、ロジックを一字一句同じにしてある。
// このブランチには元々このファイルが無く main にはあるため、マージ時に add/add の衝突自体は起きる。
// 中身が同一なら、その衝突の解決が「どちらを採っても同じ」で自明になる、というのが同一にしている理由。
//
// そのため、内部の 1文字変数（v / id）はプロジェクトの命名規約（省略形の禁止）に反しているが、
// あえて直していない。main と1文字でも変えると上記の利点が失われるため。
// 改名する場合は main 側と同時に行うこと。

// YouTube のURL文字列から動画IDを抽出する。
// youtu.be の短縮URL・youtube.com の watch?v= / embed/ / shorts/ の各形式に対応し、
// URLとして解釈できない場合や動画IDを含まない場合は null を返す。
export function getYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = parsed.searchParams.get("v");
    if (v) return v;

    const match = parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
    if (match) return match[1];
  }

  return null;
}
