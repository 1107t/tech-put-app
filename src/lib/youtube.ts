// YouTubeの短縮URL・watch・embed・shortsから動画IDを取り出す。
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
