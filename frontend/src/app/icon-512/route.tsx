import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0ABAB5",
          borderRadius: 112,
          color: "#ffffff",
          fontSize: 312,
          fontWeight: 700,
        }}
      >
        D
      </div>
    ),
    { width: 512, height: 512 },
  );
}
