import { Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CradleLaunchProps } from "./compositions/CradleLaunch.js";

const colors = {
  ink: "#10110d",
  paper: "#f6f5eb",
  acid: "#d8ff33",
  cobalt: "#3d56ff",
  coral: "#ff8065",
  darkSlate: "#181a14",
  line: "#2e302a",
};
const font = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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
      fontFamily: font,
      fontWeight: 900,
      fontSize: 32,
      letterSpacing: "-0.07em",
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

const StickerBadge = ({ text, color = colors.acid, delay = 0, rotate = -4, style }: { text: string; color?: string; delay?: number; rotate?: number; style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 20px",
        background: color,
        color: colors.ink,
        border: `4px solid ${colors.ink}`,
        boxShadow: `6px 6px 0 ${colors.ink}`,
        fontFamily: "monospace",
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center center",
        opacity: scale,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const Reveal = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 160 } });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const NeobrutalistBrowser = ({ children, title = "cradle.studio", dark = false, width = 1180, height = 680 }: { children: React.ReactNode; title?: string; dark?: boolean; width?: number; height?: number }) => (
  <div
    style={{
      width,
      height,
      overflow: "hidden",
      borderRadius: 16,
      border: `4px solid ${colors.ink}`,
      background: dark ? colors.darkSlate : colors.paper,
      boxShadow: `16px 16px 0 ${colors.ink}`,
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

// ─── Scene 1: Opening Teaser ───────────────────────────────────────────────────

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const videoScale = spring({ frame: frame - 15, fps, config: { damping: 15, stiffness: 170 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.ink,
        color: colors.paper,
        overflow: "hidden",
        fontFamily: font,
      }}
    >
      <Grain />
      <Wordmark />

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 180,
          width: 950,
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [60, 0])}px)`,
          zIndex: 20,
        }}
      >
        <StickerBadge text="Character Infrastructure" color={colors.acid} rotate={-3} delay={5} />
        <h1
          style={{
            fontSize: 110,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            lineHeight: 0.88,
            marginTop: 28,
            color: colors.paper,
          }}
        >
          Your site does not need another <span style={{ color: colors.acid, textDecoration: "underline", textDecorationColor: colors.acid }}>chat bubble.</span>
        </h1>
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: colors.coral,
            marginTop: 24,
            letterSpacing: "-0.03em",
          }}
        >
          Give your product an animated character people remember.
        </p>
      </div>

      {/* Embedded Characters Video Card */}
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 150,
          width: 680,
          height: 720,
          borderRadius: 24,
          border: `5px solid ${colors.paper}`,
          boxShadow: `20px 20px 0 ${colors.acid}`,
          overflow: "hidden",
          opacity: videoScale,
          transform: `scale(${videoScale}) rotate(3deg)`,
          background: colors.darkSlate,
          zIndex: 10,
        }}
      >
        <OffthreadVideo
          src={staticFile("shots/characters.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div style={{ position: "absolute", bottom: 20, left: 20 }}>
          <StickerBadge text="Petdex Companion Engine" color={colors.cobalt} style={{ color: colors.paper }} rotate={-2} />
        </div>
      </div>
    </div>
  );
};

// ─── Scene 2: Connect & Crawl ──────────────────────────────────────────────────

export const ConnectScene = ({ siteUrl = "qualra.xyz" }: CradleLaunchProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.paper,
        color: colors.ink,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <Wordmark dark={false} />

      <Reveal delay={5} style={{ position: "absolute", left: 100, top: 140, width: 700, zIndex: 30 }}>
        <StickerBadge text="01 / Connect Your Site" color={colors.cobalt} style={{ color: colors.paper }} rotate={-2} />
        <h2 style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.075em", marginTop: 16 }}>
          A URL is enough to begin.
        </h2>
      </Reveal>

      {/* Main Studio Onboarding Shot */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 320,
          opacity: browserProgress,
          transform: `scale(${interpolate(browserProgress, [0, 1], [0.92, 1])}) translateY(${interpolate(browserProgress, [0, 1], [50, 0])}px)`,
          zIndex: 10,
        }}
      >
        <NeobrutalistBrowser title="cradlestudio.vercel.app" width={1120} height={660}>
          <Img src={staticFile("shots/connect.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
        </NeobrutalistBrowser>
      </div>

      {/* Floating Badges */}
      <div style={{ position: "absolute", right: 100, top: 350, zIndex: 40 }}>
        <StickerBadge text="Instant Site Crawling" color={colors.acid} rotate={5} delay={40} />
      </div>
      <div style={{ position: "absolute", right: 80, top: 480, zIndex: 40 }}>
        <StickerBadge text="Brand Assets Extracted" color={colors.coral} style={{ color: colors.paper }} rotate={-3} delay={70} />
      </div>
      <div style={{ position: "absolute", right: 120, top: 610, zIndex: 40 }}>
        <StickerBadge text="Zero Code Setup" color={colors.cobalt} style={{ color: colors.paper }} rotate={4} delay={100} />
      </div>
    </div>
  );
};

// ─── Scene 3: Review Knowledge ─────────────────────────────────────────────────

export const ReviewScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 5, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.ink,
        color: colors.paper,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <Grain />
      <Wordmark />

      <Reveal delay={5} style={{ position: "absolute", left: 100, top: 140, width: 750, zIndex: 30 }}>
        <StickerBadge text="02 / Review Knowledge" color={colors.acid} rotate={-3} />
        <h2 style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.075em", marginTop: 16 }}>
          Bounded, approved source of truth.
        </h2>
      </Reveal>

      {/* Studio Review Shot */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 320,
          opacity: browserProgress,
          transform: `scale(${interpolate(browserProgress, [0, 1], [0.92, 1])}) translateY(${interpolate(browserProgress, [0, 1], [40, 0])}px)`,
          zIndex: 10,
        }}
      >
        <NeobrutalistBrowser title="cradlestudio.vercel.app/review" width={1120} height={660} dark>
          <Img src={staticFile("shots/review.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
        </NeobrutalistBrowser>
      </div>

      {/* Floating Badges */}
      <div style={{ position: "absolute", right: 90, top: 360, zIndex: 40 }}>
        <StickerBadge text="APPROVED KNOWLEDGE" color={colors.acid} rotate={-6} delay={35} />
      </div>
      <div style={{ position: "absolute", right: 110, top: 500, zIndex: 40 }}>
        <StickerBadge text="NO HALLUCINATIONS" color={colors.coral} style={{ color: colors.paper }} rotate={4} delay={65} />
      </div>
    </div>
  );
};

// ─── Scene 4: Shape & Character Catalog ───────────────────────────────────────

export const ShapeScene = ({ characterName = "Byte Bunny" }: CradleLaunchProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 5, fps, config: { damping: 16, stiffness: 150 } });
  const videoProgress = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 170 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.paper,
        color: colors.ink,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <Wordmark dark={false} />

      <Reveal delay={5} style={{ position: "absolute", left: 100, top: 140, width: 800, zIndex: 30 }}>
        <StickerBadge text="03 / Pick Your Companion" color={colors.cobalt} style={{ color: colors.paper }} rotate={-2} />
        <h2 style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.075em", marginTop: 16 }}>
          Petdex catalog & usage meters.
        </h2>
      </Reveal>

      {/* Left: Studio Shape Screen Shot */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 320,
          opacity: browserProgress,
          transform: `scale(${interpolate(browserProgress, [0, 1], [0.92, 1])})`,
          zIndex: 10,
        }}
      >
        <NeobrutalistBrowser title="cradlestudio.vercel.app/shape" width={1020} height={660}>
          <Img src={staticFile("shots/shape.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
        </NeobrutalistBrowser>
      </div>

      {/* Right: Video Loop of Animated Petdex Character */}
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 260,
          width: 640,
          height: 680,
          borderRadius: 20,
          border: `5px solid ${colors.ink}`,
          boxShadow: `16px 16px 0 ${colors.cobalt}`,
          overflow: "hidden",
          opacity: videoProgress,
          transform: `scale(${videoProgress}) rotate(2deg)`,
          background: colors.darkSlate,
          zIndex: 20,
        }}
      >
        <OffthreadVideo src={staticFile("shots/characters.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20 }}>
          <StickerBadge text="99 Conversations / Mo" color={colors.acid} rotate={-3} delay={45} />
        </div>
      </div>
    </div>
  );
};

// ─── Scene 5: Live Website Customer Experience ────────────────────────────────

export const LiveSiteScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserProgress = spring({ frame: frame - 5, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.ink,
        color: colors.paper,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <Grain />
      <Wordmark />

      <Reveal delay={5} style={{ position: "absolute", left: 100, top: 140, width: 800, zIndex: 30 }}>
        <StickerBadge text="04 / Live Deployment" color={colors.acid} rotate={-3} />
        <h2 style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 900, letterSpacing: "-0.075em", marginTop: 16 }}>
          Live on any customer website.
        </h2>
      </Reveal>

      {/* Customer Site Shot */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 320,
          opacity: browserProgress,
          transform: `scale(${interpolate(browserProgress, [0, 1], [0.92, 1])}) translateY(${interpolate(browserProgress, [0, 1], [40, 0])}px)`,
          zIndex: 10,
        }}
      >
        <NeobrutalistBrowser title="qualra.xyz" width={1120} height={660} dark>
          <Img src={staticFile("shots/site.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
        </NeobrutalistBrowser>
      </div>

      {/* Floating Badges */}
      <div style={{ position: "absolute", right: 90, top: 360, zIndex: 40 }}>
        <StickerBadge text="LIVE WIDGET INGESTED" color={colors.acid} rotate={-4} delay={35} />
      </div>
      <div style={{ position: "absolute", right: 110, top: 500, zIndex: 40 }}>
        <StickerBadge text="REACT 18 & 19 ZERO-CONFIG" color={colors.cobalt} style={{ color: colors.paper }} rotate={4} delay={65} />
      </div>
    </div>
  );
};

// ─── Scene 6: Outro & Call to Action ──────────────────────────────────────────

export const ClosingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 140 } });
  const videoProgress = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 170 } });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: colors.paper,
        color: colors.ink,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <Wordmark dark={false} />

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 200,
          width: 980,
          opacity: textProgress,
          transform: `translateY(${interpolate(textProgress, [0, 1], [50, 0])}px)`,
          zIndex: 20,
        }}
      >
        <StickerBadge text="Open Source Character Infrastructure" color={colors.cobalt} style={{ color: colors.paper }} rotate={-3} delay={5} />
        <h1
          style={{
            fontSize: 105,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            lineHeight: 0.88,
            marginTop: 28,
            color: colors.ink,
          }}
        >
          Give your website a soul.
        </h1>
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: colors.cobalt,
            marginTop: 24,
            letterSpacing: "-0.03em",
          }}
        >
          Build & deploy in minutes with Cradle Studio.
        </p>

        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 24 }}>
          <StickerBadge text="pnpm add @maranga/cradle" color={colors.acid} rotate={-2} delay={30} />
          <StickerBadge text="https://cradlestudio.vercel.app" color={colors.coral} style={{ color: colors.paper }} rotate={2} delay={45} />
        </div>
      </div>

      {/* Closing Characters Video Card */}
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 180,
          width: 680,
          height: 680,
          borderRadius: 24,
          border: `5px solid ${colors.ink}`,
          boxShadow: `20px 20px 0 ${colors.acid}`,
          overflow: "hidden",
          opacity: videoProgress,
          transform: `scale(${videoProgress}) rotate(-3deg)`,
          background: colors.darkSlate,
          zIndex: 10,
        }}
      >
        <OffthreadVideo src={staticFile("shots/characters.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};
