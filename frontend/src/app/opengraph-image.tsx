import { site } from "@/config/site";
import { ImageResponse } from "next/og";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0abab5 0%, #099e9a 55%, #067a77 100%)",
          padding: "64px 72px",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
            {site.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            {site.tagline}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              opacity: 0.92,
              maxWidth: 820,
            }}
          >
            Share builds, follow developers, and message your cohort — all in one
            community feed.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
