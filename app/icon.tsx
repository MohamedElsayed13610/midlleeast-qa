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
          border: "18px solid #c2a066",
          borderRadius: 88,
          padding: 54,
        }}
      >
        <img
          src="https://lmelawfirm.com/assets/brand/logo-white.png"
          alt=""
          width="360"
          height="360"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
