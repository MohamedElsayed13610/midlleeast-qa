import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const logoUrl = new URL("/assets/brand/logo-white.png", request.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#053128",
          borderRadius: "18px",
          padding: "8px",
        }}
      >
        <img
          src={logoUrl}
          alt="Middle East & Partners Law Firm"
          width="80"
          height="80"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      width: 96,
      height: 96,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
