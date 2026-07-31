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
