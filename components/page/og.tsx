import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Typographic 1200×630 Open Graph card (ivory, maroon, brass). Replace with a photo card once photos exist. */
export function ogCard({ kicker, title, line }: { kicker: string; title: string; line?: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#5e1a1a", color: "#f7f1e6", padding: "72px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: "#d9c3a0" }}>
          <div style={{ width: 56, height: 1, background: "#b08d57" }} />
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1, fontFamily: "serif", letterSpacing: -1 }}>{title}</div>
          {line && <div style={{ marginTop: 28, fontSize: 34, color: "#ede2cf", fontFamily: "serif" }}>{line}</div>}
        </div>
        <div style={{ display: "flex", height: 2, background: "#b08d57", width: 220 }} />
      </div>
    ),
    ogSize,
  );
}
