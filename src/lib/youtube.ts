// src/lib/youtube.ts【修正】
// YouTubeの動画URLから動画IDを取り出す共通処理。
// 全体の動画一覧と受講生別の動画一覧で、同じURL解析を使う。

// 短縮URL・watch・embed・shortsに対応し、動画IDを取得できない場合はnullを返す。
export function getYouTubeVideoId(url: string): string | null {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsedUrl.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const videoId = parsedUrl.pathname.slice(1).split("/")[0];
    return videoId || null;
  }

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    const videoId = parsedUrl.searchParams.get("v");
    if (videoId) return videoId;

    const pathMatch = parsedUrl.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
    if (pathMatch) return pathMatch[1];
  }

  return null;
}
