import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Security check: Only proxy assets from trusted CDNs (e.g. assets.petdex.dev)
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (parsed.hostname !== "assets.petdex.dev" && !parsed.hostname.endsWith(".petdex.dev")) {
    return new NextResponse("Forbidden domain", { status: 403 });
  }

  try {
    // Fetch server-side without sending foreign host Referer header to bypass Cloudflare Hotlink Protection
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Cradle-Runtime-AssetProxy/1.0",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Asset fetch failed: ${response.status}`, { status: response.status });
    }

    const blob = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/webp";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (error) {
    return new NextResponse("Proxy error: " + (error instanceof Error ? error.message : "Unknown error"), { status: 500 });
  }
}
