import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#03261e",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dcc28e",
            fontFamily: "Arial, sans-serif",
            fontSize: 176,
            fontWeight: 800,
            letterSpacing: -14,
            lineHeight: 1,
          }}
        >
          LME
        </div>
      </div>
    ),
    size,
  );
}
