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
      textShadow: dark ? `2px 2px 0 ${colors.ink}` : "none",
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
          textShadow: (!highlight && color === colors.paper) ? `3px 3px 0 ${colors.ink}` : "none",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Annotation Components ────────────────────────────────────────────────────────

const NeoPointer = ({ delay, startX, startY, endX, endY }: { delay: number, startX: number, startY: number, endX: number, endY: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 80 } });
  
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);
  const scale = interpolate(progress, [0, 0.8, 1], [0.5, 1.2, 1]);

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${scale})`,
      zIndex: 100,
      opacity: progress > 0 ? 1 : 0
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill={colors.coral} stroke={colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(4px 4px 0 ${colors.ink})` }}>
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>
    </div>
  );
};

const NeoHighlight = ({ delay, left, top, width, height }: { delay: number, left: number, top: number, width: number, height: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
  
  return (
    <div style={{
      position: "absolute",
      left,
      top,
      width,
      height,
      border: `6px solid ${colors.coral}`,
      borderRadius: 16,
      boxShadow: `12px 12px 0 ${colors.acid}`,
      zIndex: 80,
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [1.1, 1])})`,
      pointerEvents: "none"
    }} />
  );
};

const NeoTooltip = ({ delay, text, left, top, rotate = -2 }: { delay: number, text: string, left: number, top: number, rotate?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 90 } });
  
  return (
    <div style={{
      position: "absolute",
      left,
      top,
      padding: "16px 24px",
      background: colors.paper,
      border: `4px solid ${colors.ink}`,
      boxShadow: `12px 12px 0 ${colors.ink}`,
      borderRadius: 12,
      fontFamily,
      fontSize: 36,
      fontWeight: 800,
      color: colors.ink,
      zIndex: 90,
      transform: `scale(${progress}) rotate(${rotate}deg)`,
      transformOrigin: "bottom left"
    }}>
      {text}
    </div>
  );
};

// ─── Scene 1: The Hook ──────────────────────────────────────────────────────────

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 300], [1.1, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />
      
      {/* Fullscreen Asset */}
      <div style={{ position: "absolute", inset: 24, borderRadius: 24, overflow: "hidden", border: `6px solid ${colors.ink}`, boxShadow: `0 0 0 4px ${colors.paper}` }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(${zoom})`, transformOrigin: "center" }}>
          <OffthreadVideo src={staticFile("shots/characters.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 30, gap: 16 }}>
        <NeoText text="Websites used to" delay={10} size={96} color={colors.paper} />
        <NeoText text="have personality." delay={20} size={96} color={colors.ink} highlight />
        <div style={{ height: 40 }} />
        <NeoText text="Let's bring that back." delay={80} size={64} color={colors.acid} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: The Reveal ────────────────────────────────────────────────────────

export const ConnectScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panY = interpolate(frame, [0, 300], [0, -60], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={false} />
      <Grain />

      {/* Fullscreen Asset */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: colors.paper }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(1.2) translateY(${panY}px)`, transformOrigin: "top center" }}>
          <Img src={staticFile("shots/connect.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 10 }} />

      <NeoTooltip delay={15} text="1. Give it knowledge." left={120} top={200} rotate={-3} />
      <NeoPointer delay={30} startX={800} startY={800} endX={540} endY={420} />
      
      <div style={{ position: "absolute", bottom: 100, width: "100%", textAlign: "center", zIndex: 20 }}>
        <NeoText text="Connect any URL." delay={45} size={56} color={colors.paper} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: The Workflow (Knowledge) ──────────────────────────────────────────

export const ReviewScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panX = interpolate(frame, [0, 300], [0, -40], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />
      
      {/* Fullscreen Asset */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: colors.darkSlate }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(1.15) translateX(${panX}px)`, transformOrigin: "center left" }}>
          <Img src={staticFile("shots/review.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center left" }} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 10 }} />

      <NeoTooltip delay={15} text="2. It learns your brand's essence." left={450} top={180} rotate={2} />
      <NeoHighlight delay={35} left={150} top={280} width={900} height={360} />
      
    </AbsoluteFill>
  );
};

// ─── Scene 4: The Workflow (Character) ──────────────────────────────────────────

export const ShapeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 300], [1, 1.1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />
      
      {/* Fullscreen Asset */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: colors.darkSlate }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(${zoom})`, transformOrigin: "center right" }}>
          <Img src={staticFile("shots/shape.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center right" }} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 10 }} />

      <NeoTooltip delay={15} text="3. Pick a character." left={120} top={250} rotate={-2} />
      <NeoPointer delay={30} startX={400} startY={800} endX={750} endY={450} />

      <div style={{ position: "absolute", bottom: 100, width: "100%", textAlign: "center", zIndex: 20 }}>
        <NeoText text="Browse the Petdex." delay={45} size={56} color={colors.paper} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Live Site Deployment ──────────────────────────────────────────────

export const LiveSiteScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panY = interpolate(frame, [0, 300], [0, 40], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.paper, fontFamily }}>
      <Wordmark dark={true} />
      <Grain />
      
      {/* Fullscreen Asset */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: colors.darkSlate }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(1.1) translateY(${panY}px)`, transformOrigin: "bottom center" }}>
          <Img src={staticFile("shots/site.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "bottom right" }} />
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)", zIndex: 10 }} />

      <NeoTooltip delay={15} text="Ready for any site." left={380} top={320} rotate={3} />
      <NeoPointer delay={25} startX={100} startY={600} endX={950} endY={550} />
      
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
