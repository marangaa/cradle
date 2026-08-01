import { loadFont } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Grain, Wordmark } from "../scenes";

const { fontFamily } = loadFont();

const colors = {
  ink: "#10110d",
  paper: "#f6f5eb",
  acid: "#d8ff33",
  cobalt: "#3d56ff",
  coral: "#ff8065",
};

/** Still thumbnail paired with the launch composition. */
export const LaunchThumbnail = () => {
  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, overflow: "hidden", fontFamily }}>
      <Wordmark dark={true} />
      <Grain />

      <div style={{ position: "absolute", left: 100, top: 220, width: 950, zIndex: 20 }}>
        <h1 style={{ fontSize: 96, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: 0, color: colors.paper }}>
          An open-source programmable web companion.
        </h1>
        <p style={{ fontSize: 36, fontWeight: 700, color: colors.acid, marginTop: 32 }}>
          Websites used to have personality. Let's bring that back.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          right: -50,
          top: 150,
          width: 780,
          height: 780,
          borderRadius: 40,
          border: `8px solid ${colors.ink}`,
          boxShadow: `30px 30px 0 ${colors.coral}`,
          overflow: "hidden",
          background: colors.paper,
          transform: "rotate(-3deg)",
          zIndex: 10,
        }}
      >
        <OffthreadVideo src={staticFile("shots/characters.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};
