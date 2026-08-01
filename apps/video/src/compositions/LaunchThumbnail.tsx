import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Grain, Wordmark } from "../scenes";

/** Still thumbnail paired with the launch composition. */
export const LaunchThumbnail = () => {
  return (
    <AbsoluteFill style={{ background: "#10110d", color: "#f6f5eb", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      <Grain />
      <Wordmark dark />

      <div style={{ position: "absolute", left: 100, top: 220, width: 950, zIndex: 20 }}>
        <div
          style={{
            display: "inline-block",
            padding: "10px 22px",
            background: "#d8ff33",
            color: "#10110d",
            border: "4px solid #10110d",
            boxShadow: "6px 6px 0 #10110d",
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: 20,
            textTransform: "uppercase",
            transform: "rotate(-3deg)",
          }}
        >
          Character Infrastructure
        </div>
        <h1 style={{ fontSize: 110, fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 0.88, marginTop: 28, color: "#f6f5eb" }}>
          Give your website <span style={{ color: "#d8ff33" }}>a soul.</span>
        </h1>
        <p style={{ fontSize: 32, fontWeight: 700, color: "#ff8065", marginTop: 24 }}>
          Build & deploy in minutes with Cradle.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 170,
          width: 680,
          height: 700,
          borderRadius: 24,
          border: "5px solid #f6f5eb",
          boxShadow: "20px 20px 0 #d8ff33",
          overflow: "hidden",
          transform: "rotate(3deg)",
          background: "#181a14",
          zIndex: 10,
        }}
      >
        <OffthreadVideo src={staticFile("shots/characters.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};
