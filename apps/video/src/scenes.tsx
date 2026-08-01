import { loadFont } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CradleLaunchProps } from "./compositions/CradleLaunch.js";

const { fontFamily } = loadFont();

// Neobrutalist colors
const colors = {
  ink: "#10110d",
  paper: "#f6f5eb",
  acid: "#d8ff33",
  cobalt: "#3d56ff",
  coral: "#ff8065",
  darkSlate: "#181a14",
  line: "#2e302a",
};

export const Grain = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.12,
      backgroundImage: "radial-gradient(rgba(255,255,255,.9) .6px, transparent .9px)",
      backgroundSize: "6px 6px",
      mixBlendMode: "soft-light",
      pointerEvents: "none",
      zIndex: 999,
    }}
  />
);

export const Wordmark = ({ dark = true }: { dark?: boolean }) => (
  <div
    style={{
      position: "absolute",
      top: 50,
      left: 70,
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily,
      fontWeight: 900,
      fontSize: 32,
      letterSpacing: "-0.04em",
      color: dark ? colors.paper : colors.ink,
      zIndex: 50,
    }}
  >
    <span
      style={{
        display: "grid",
        width: 38,
        height: 38,
        placeItems: "center",
        borderRadius: "10px",
        background: colors.acid,
        color: colors.ink,
        fontSize: 22,
        fontWeight: 900,
        border: `3px solid ${colors.ink}`,
        boxShadow: `3px 3px 0 ${colors.ink}`,
      }}
    >
      C
    </span>
    Cradle
  </div>
);

// Kinetic typography helper for bold neobrutalist reveals
const NeoText = ({ text, delay = 0, size = 84, color = colors.ink, highlight = false }: { text: string; delay?: number; size?: number; color?: string; highlight?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
  
  return (
    <div style={{ overflow: "hidden", display: "inline-block", padding: highlight ? "4px 16px" : 0, background: highlight ? colors.acid : "transparent", transform: highlight ? `rotate(-2deg)` : "none" }}>
      <div
        style={{
          transform: `translateY(${interpolate(progress, [0, 1], [110, 0])}%)`,
          fontSize: size,
          fontWeight: 900,
          color,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          fontFamily,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const NeobrutalistBrowser = ({ children, title = "cradlestudio.vercel.app", dark = false, width = 1180, height = 680 }: { children: React.ReactNode; title?: string; dark?: boolean; width?: number; height?: number }) => (
  <div
    style={{
      width,
      height,
      overflow: "hidden",
      borderRadius: 16,
      border: `4px solid ${colors.ink}`,
      background: dark ? colors.darkSlate : colors.paper,
      boxShadow: `24px 24px 0 ${colors.ink}`,
      position: "relative",
    }}
  >
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        borderBottom: `4px solid ${colors.ink}`,
        background: dark ? "#11130e" : "#e6e3d5",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <i style={{ display: "block", width: 14, height: 14, borderRadius: "50%", background: colors.coral, border: `2px solid ${colors.ink}` }} />
        <i style={{ display: "block", width: 14, height: 14, borderRadius: "50%", background: colors.acid, border: `2px solid ${colors.ink}` }} />
        <i style={{ display: "block", width: 14, height: 14, borderRadius: "50%", background: colors.cobalt, border: `2px solid ${colors.ink}` }} />
      </div>
      <div
        style={{
          marginLeft: 20,
          flex: 1,
          maxWidth: 580,
          height: 32,
          borderRadius: 8,
          background: dark ? "#22251d" : "#ffffff",
          color: dark ? colors.paper : colors.ink,
          border: `2px solid ${colors.ink}`,
          font: "800 14px monospace",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        https://{title}
      </div>
    </div>
    <div style={{ height: height - 56, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

// ─── Scene 1: The Hook ──────────────────────────────────────────────────────────

export const OpeningScene = () => {
  return (
    <AbsoluteFill style={{ background: colors.paper, color: colors.ink, fontFamily }}>
      <Wordmark dark={false} />
      <Grain />
      
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: 16 }}>
        <NeoText text="Websites used to" delay={10} size={96} color={colors.ink} />
        <NeoText text="have personality." delay={20} size={96} color={colors.ink} highlight />
        <div style={{ height: 40 }} />
        <NeoText text="Let's bring that back." delay={80} size={64} color={colors.cobalt} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: The Reveal ────────────────────────────────────────────────────────

export const ConnectScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const videoProgress = spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />

      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <NeoText text="An open-source programmable" delay={5} size={72} color={colors.paper} />
        <NeoText text="web companion." delay={10} size={72} color={colors.paper} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 320,
          left: "50%",
          marginLeft: -380,
          width: 760,
          height: 520,
          borderRadius: 24,
          overflow: "hidden",
          border: `6px solid ${colors.ink}`,
          boxShadow: `24px 24px 0 ${colors.acid}`,
          opacity: videoProgress,
          background: colors.paper,
          transform: `scale(${interpolate(videoProgress, [0, 1], [0.8, 1])}) translateY(${interpolate(videoProgress, [0, 1], [80, 0])}px) rotate(-2deg)`,
          zIndex: 10,
        }}
      >
        <OffthreadVideo
          src={staticFile("shots/characters.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: The Workflow (Knowledge) ──────────────────────────────────────────

export const ReviewScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 90 } });
  
  // Cinematic slow zoom out and pan
  const scale = interpolate(frame, [0, 300], [1.05, 0.95], { extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, 300], [0, -40], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.paper, color: colors.ink, fontFamily }}>
      <Wordmark dark={false} />
      <Grain />
      
      <div style={{ position: "absolute", left: 100, top: 220, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <NeoText text="1. Give it knowledge." delay={10} size={72} color={colors.ink} highlight />
        <div style={{ opacity: spring({ frame: frame - 30, fps }), fontSize: 32, fontWeight: 700, width: 400, marginTop: 16, color: colors.line, lineHeight: 1.3 }}>
          Connect any URL.<br/>The engine extracts your brand's essence instantly.
        </div>
      </div>

      <div style={{ position: "absolute", right: -50, top: 120, zIndex: 10, transform: `scale(${scale}) translateY(${panY}px)` }}>
        <div style={{
          opacity: browserProgress,
          transform: `translateY(${interpolate(browserProgress, [0, 1], [100, 0])}px) rotate(2deg)`,
        }}>
          <NeobrutalistBrowser title="cradlestudio.vercel.app" width={1000} height={700}>
            <Img src={staticFile("shots/connect.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
          </NeobrutalistBrowser>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: The Workflow (Character) ──────────────────────────────────────────

export const ShapeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 90 } });
  const panY = interpolate(frame, [0, 300], [0, -30], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />
      
      <div style={{ position: "absolute", right: 100, top: 250, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, textAlign: "right" }}>
        <NeoText text="2. Pick a character." delay={10} size={72} color={colors.ink} highlight />
        <div style={{ opacity: spring({ frame: frame - 30, fps }), fontSize: 32, fontWeight: 700, width: 400, marginTop: 16, color: colors.paper, lineHeight: 1.3 }}>
          Browse the Petdex. Select the perfect companion.
        </div>
      </div>

      <div style={{ position: "absolute", left: 60, top: 160, zIndex: 10, transform: `translateY(${panY}px)` }}>
        <div style={{
          opacity: browserProgress,
          transform: `translateY(${interpolate(browserProgress, [0, 1], [100, 0])}px) rotate(-2deg)`,
        }}>
          <NeobrutalistBrowser title="cradlestudio.vercel.app/shape" width={900} height={660} dark>
            <Img src={staticFile("shots/shape.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
          </NeobrutalistBrowser>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Live Site Deployment ──────────────────────────────────────────────

export const LiveSiteScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 90 } });
  const zoom = interpolate(frame, [0, 300], [0.95, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.paper, color: colors.ink, fontFamily }}>
      <Wordmark dark={false} />
      <Grain />
      
      <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center", zIndex: 30, display: "flex", justifyContent: "center" }}>
        <NeoText text="3. Drop it on any site." delay={10} size={84} color={colors.ink} highlight />
      </div>

      <div style={{ 
        position: "absolute", 
        top: 260, 
        left: "50%", 
        marginLeft: -560,
        width: 1120, 
        height: 680, 
        zIndex: 10,
        opacity: browserProgress,
        transform: `translateY(${interpolate(browserProgress, [0, 1], [60, 0])}px) scale(${zoom})`,
      }}>
        <NeobrutalistBrowser title="qualra.xyz" width={1120} height={680} dark>
          <Img src={staticFile("shots/site.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
        </NeobrutalistBrowser>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: Outro ─────────────────────────────────────────────────────────────

export const ClosingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Grain />
      
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: 20 }}>
        <span
          style={{
            display: "grid",
            width: 80,
            height: 80,
            placeItems: "center",
            borderRadius: "20px",
            background: colors.acid,
            color: colors.ink,
            fontSize: 48,
            fontWeight: 900,
            border: `6px solid ${colors.ink}`,
            boxShadow: `10px 10px 0 ${colors.coral}`,
            opacity: spring({ frame: frame - 10, fps }),
            transform: `scale(${spring({ frame: frame - 10, fps, config: { damping: 14 } })}) rotate(4deg)`,
            marginBottom: 20
          }}
        >
          C
        </span>
        <NeoText text="Open-source." delay={20} size={64} color={colors.paper} />
        <NeoText text="Framework-agnostic." delay={30} size={64} color={colors.paper} />
        
        <div style={{ height: 40 }} />
        
        <div style={{ 
          opacity: spring({ frame: frame - 60, fps }), 
          fontSize: 32, 
          fontWeight: 900, 
          color: colors.ink, 
          background: colors.acid,
          padding: "16px 32px",
          border: `4px solid ${colors.ink}`,
          boxShadow: `8px 8px 0 ${colors.coral}`,
          transform: "rotate(-2deg)"
        }}>
          cradlestudio.vercel.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
