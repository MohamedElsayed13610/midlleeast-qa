import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-static";

export function GET() {
  const svg = readFileSync(join(process.cwd(), "public", "favicon.svg"), "utf8");
  const match = svg.match(/data:image\/png;base64,([^\"]+)/);

  if (!match) {
    return new Response(null, { status: 404 });
  }

  const body = Buffer.from(match[1], "base64");

  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
