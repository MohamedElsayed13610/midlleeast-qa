import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-static";

export function GET() {
  const body = readFileSync(join(process.cwd(), "public", "assets", "brand", "logo-white.png"));

  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
