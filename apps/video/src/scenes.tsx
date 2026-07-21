import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CradleLaunchProps } from "./compositions/CradleLaunch";

const colors = { ink: "#10110d", paper: "#f6f5eb", acid: "#d8ff33", cobalt: "#3d56ff", coral: "#ff8065", line: "#2e302a" };
const font = "Arial, Helvetica, sans-serif";

export const Grain = () => <div style={{ position: "absolute", inset: 0, opacity: 0.13, backgroundImage: "radial-gradient(rgba(255,255,255,.8) .5px, transparent .8px)", backgroundSize: "5px 5px", mixBlendMode: "soft-light" }} />;

export const Wordmark = () => (
  <div style={{ position: "absolute", top: 60, left: 70, display: "flex", alignItems: "center", gap: 16, fontFamily: font, fontWeight: 800, fontSize: 28, letterSpacing: "-0.07em" }}>
    <span style={{ display: "grid", width: 31, height: 31, placeItems: "center", borderRadius: "50%", background: colors.acid, color: colors.ink, fontSize: 17 }}>C</span>
    Cradle
  </div>
);

const Reveal = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 24 });
  return <div style={{ opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [28, 0])}px)`, ...style }}>{children}</div>;
};

export const CharacterOrb = ({ label, scale = 1, mood = "idle" }: { label: string; scale?: number; mood?: "idle" | "curious" | "awake" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bob = Math.sin((frame / fps) * Math.PI * 2 * 0.7) * 9;
  const blink = frame % 97 < 6 ? 0.16 : 1;
  const shift = mood === "curious" ? Math.sin(frame / 12) * 5 : 0;
  return (
    <div style={{ width: 240 * scale, height: 240 * scale, position: "relative", transform: `translateY(${bob}px) translateX(${shift}px)` }} aria-label={label}>
      <div style={{ position: "absolute", inset: "9% 4% 0", borderRadius: "47% 53% 48% 52%", background: `linear-gradient(145deg, ${colors.acid}, #b2d726)`, border: `7px solid ${colors.ink}`, boxShadow: `12px 14px 0 ${colors.ink}` }} />
      <div style={{ position: "absolute", left: "24%", top: "27%", width: "52%", height: "45%", borderRadius: "48%", background: colors.paper, border: `6px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: "35%", top: "43%", width: "7%", height: "10%", borderRadius: "50%", transform: `scaleY(${blink})`, background: colors.ink }} />
      <div style={{ position: "absolute", right: "35%", top: "43%", width: "7%", height: "10%", borderRadius: "50%", transform: `scaleY(${blink})`, background: colors.ink }} />
      <div style={{ position: "absolute", left: "44%", top: "56%", width: "12%", height: "8%", borderRadius: "0 0 12px 12px", borderBottom: `4px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: "13%", top: "5%", width: "26%", height: "39%", borderRadius: "80% 20% 30% 30%", background: colors.acid, border: `7px solid ${colors.ink}`, transform: "rotate(-18deg)" }} />
      <div style={{ position: "absolute", right: "13%", top: "5%", width: "26%", height: "39%", borderRadius: "20% 80% 30% 30%", background: colors.acid, border: `7px solid ${colors.ink}`, transform: "rotate(18deg)" }} />
    </div>
  );
};

const Browser = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div style={{ width: 1110, height: 640, overflow: "hidden", borderRadius: 20, border: `3px solid ${dark ? "#ffffff" : colors.ink}`, background: dark ? colors.ink : colors.paper, boxShadow: `18px 20px 0 ${dark ? colors.acid : colors.ink}` }}>
    <div style={{ height: 60, display: "flex", alignItems: "center", gap: 9, padding: "0 20px", borderBottom: `3px solid ${dark ? "#ffffff" : colors.ink}` }}>
      {["#ff8065", "#d8ff33", "#3d56ff"].map((color) => <i key={color} style={{ display: "block", width: 13, height: 13, borderRadius: "50%", background: color }} />)}
      <div style={{ marginLeft: 17, width: 520, height: 29, borderRadius: 7, background: dark ? "#282a23" : "#e7e4d8", color: dark ? "#f6f5eb" : colors.ink, font: "600 14px monospace", display: "flex", alignItems: "center", padding: "0 13px" }}>cradle.studio</div>
    </div>
    {children}
  </div>
);

const SiteCapture = ({ screenshot, siteUrl }: { screenshot?: string; siteUrl: string }) => screenshot ? <Img src={staticFile(screenshot)} style={{ width: "100%", height: 577, objectFit: "cover" }} /> : (
  <div style={{ height: 577, padding: 50, background: "#f6f5eb", fontFamily: font }}>
    <div style={{ fontSize: 17, color: "#63655c", marginBottom: 40 }}>{siteUrl}</div>
    <div style={{ width: 400, fontSize: 49, fontWeight: 800, letterSpacing: "-0.07em", lineHeight: 0.9 }}>Every conversation becomes part of a relationship.</div>
    <div style={{ marginTop: 36, width: 390, height: 18, background: "#d9d7cc" }} />
    <div style={{ marginTop: 13, width: 350, height: 18, background: "#d9d7cc" }} />
    <div style={{ marginTop: 55, width: 160, height: 46, border: `3px solid ${colors.ink}`, background: colors.acid, display: "grid", placeItems: "center", fontWeight: 800 }}>Meet Qualra</div>
    <div style={{ position: "absolute", right: 80, bottom: 24 }}><CharacterOrb label="site character" scale={0.55} mood="awake" /></div>
  </div>
);

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const textProgress = spring({ frame, fps: 30, config: { damping: 200 }, durationInFrames: 27 });
  return <div style={{ position: "relative", width: "100%", height: "100%", background: colors.ink, color: colors.paper, overflow: "hidden", fontFamily: font }}>
    <Grain /><Wordmark />
    <div style={{ position: "absolute", left: 150, top: 278, width: 1110, fontSize: 122, fontWeight: 800, letterSpacing: "-0.09em", lineHeight: 0.84, transform: `translateY(${interpolate(textProgress, [0, 1], [60, 0])}px)`, opacity: textProgress }}>Your site does not need another chat bubble.</div>
    <div style={{ position: "absolute", right: 185, bottom: 158 }}><CharacterOrb label="Cradle character" scale={1.05} mood="curious" /></div>
    <div style={{ position: "absolute", left: 150, bottom: 100, color: colors.acid, font: "700 22px monospace" }}>A CHARACTER PEOPLE CAN REMEMBER.</div>
  </div>;
};

export const ConnectScene = ({ siteUrl, screenshots }: CradleLaunchProps) => {
  const frame = useCurrentFrame();
  const cursor = interpolate(frame, [40, 135], [420, 840], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const typed = siteUrl.slice(0, Math.max(1, Math.floor(interpolate(frame, [50, 118], [1, siteUrl.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  return <div style={{ position: "relative", width: "100%", height: "100%", background: colors.paper, color: colors.ink, fontFamily: font, overflow: "hidden" }}>
    <Wordmark />
    <Reveal delay={4} style={{ position: "absolute", left: 150, top: 155, width: 650 }}><div style={{ color: colors.cobalt, font: "700 18px monospace", marginBottom: 24 }}>01 / START WITH THE SITE</div><div style={{ fontSize: 65, lineHeight: 0.93, fontWeight: 800, letterSpacing: "-0.075em" }}>A URL is enough to begin.</div></Reveal>
    <div style={{ position: "absolute", left: 150, top: 400 }}><Browser><div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", height: 577, position: "relative" }}><div style={{ padding: 48, borderRight: `3px solid ${colors.ink}` }}><div style={{ fontWeight: 800, fontSize: 21 }}>Connect a website</div><div style={{ marginTop: 77, fontSize: 15, fontWeight: 700 }}>WEBSITE URL</div><div style={{ marginTop: 12, border: `3px solid ${colors.ink}`, height: 66, padding: "0 18px", display: "flex", alignItems: "center", font: "600 25px monospace" }}>{typed}<span style={{ opacity: frame % 22 < 11 ? 1 : 0 }}>|</span></div><div style={{ marginTop: 20, width: 205, height: 51, background: colors.acid, border: `3px solid ${colors.ink}`, display: "grid", placeItems: "center", fontWeight: 800 }}>BUILD CRADLE</div></div><div style={{ position: "relative", overflow: "hidden" }}><SiteCapture screenshot={screenshots.studio} siteUrl={siteUrl} /></div><div style={{ position: "absolute", left: cursor, top: 266, width: 22, height: 31, background: colors.ink, clipPath: "polygon(0 0, 0 100%, 28% 72%, 47% 100%, 63% 92%, 44% 64%, 82% 64%)" }} /></div></Browser></div>
    <Reveal delay={150} style={{ position: "absolute", right: 165, top: 310, width: 400, fontSize: 30, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.045em" }}>Cradle turns reviewed public material into a project you can shape.</Reveal>
  </div>;
};

export const ShapeScene = ({ characterName, siteName }: CradleLaunchProps) => {
  const frame = useCurrentFrame();
  const selected = frame > 115;
  return <div style={{ position: "relative", width: "100%", height: "100%", background: colors.ink, color: colors.paper, fontFamily: font, overflow: "hidden" }}>
    <Grain /><Wordmark />
    <Reveal delay={3} style={{ position: "absolute", left: 150, top: 150, width: 720 }}><div style={{ color: colors.acid, font: "700 18px monospace", marginBottom: 24 }}>02 / GIVE IT A CHARACTER</div><div style={{ fontSize: 65, lineHeight: 0.93, fontWeight: 800, letterSpacing: "-0.075em" }}>This is not a profile picture.</div></Reveal>
    <div style={{ position: "absolute", left: 150, top: 418, display: "flex", gap: 38 }}>
      {["Boba", "Boxcat", characterName].map((name, index) => <div key={name} style={{ width: 225, height: 310, border: `${index === 2 && selected ? 5 : 2}px solid ${index === 2 && selected ? colors.acid : "#74766c"}`, background: index === 2 && selected ? "#20231b" : "#161711", transition: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 18, boxShadow: index === 2 && selected ? `9px 9px 0 ${colors.acid}` : "none" }}><div style={{ fontWeight: 800, fontSize: 16 }}>{name}</div><div style={{ alignSelf: "center" }}><CharacterOrb label={name} scale={0.58} mood={index === 2 ? "awake" : "idle"} /></div></div>)}
    </div>
    <div style={{ position: "absolute", right: 170, top: 340, width: 480, height: 460, border: `3px solid ${colors.paper}`, padding: 42 }}><div style={{ color: colors.acid, font: "700 17px monospace", marginBottom: 33 }}>ON {siteName.toUpperCase()}</div><div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.055em", lineHeight: 1.02 }}>{characterName} responds to the product around it.</div><div style={{ display: "flex", gap: 12, marginTop: 42 }}>{["idle", "curious", "awake"].map((state, index) => <div key={state} style={{ padding: "10px 13px", border: `2px solid ${index === Math.floor(frame / 55) % 3 ? colors.acid : "#6e7068"}`, color: index === Math.floor(frame / 55) % 3 ? colors.acid : colors.paper, font: "700 14px monospace" }}>{state}</div>)}</div><div style={{ position: "absolute", right: 28, bottom: 20 }}><CharacterOrb label={characterName} scale={0.7} mood="curious" /></div></div>
  </div>;
};

export const InstallScene = ({ siteUrl, characterName, screenshots }: CradleLaunchProps) => {
  const frame = useCurrentFrame();
  const reveal = Math.floor(interpolate(frame, [54, 180], [0, 154], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const snippet = `<script src="https://unpkg.com/@maranga/cradle"></script>\n<cradle-character project="${siteUrl}" character="${characterName.toLowerCase().replaceAll(" ", "-")}"></cradle-character>`;
  return <div style={{ position: "relative", width: "100%", height: "100%", background: colors.paper, color: colors.ink, fontFamily: font, overflow: "hidden" }}>
    <Wordmark />
    <Reveal delay={3} style={{ position: "absolute", left: 150, top: 150, width: 700 }}><div style={{ color: colors.cobalt, font: "700 18px monospace", marginBottom: 24 }}>03 / MAKE IT YOURS</div><div style={{ fontSize: 65, lineHeight: 0.93, fontWeight: 800, letterSpacing: "-0.075em" }}>It belongs on your page, not inside ours.</div></Reveal>
    <div style={{ position: "absolute", left: 150, top: 413 }}><Browser dark><div style={{ height: 577, position: "relative", padding: 60, color: colors.paper }}><div style={{ color: colors.acid, font: "700 16px monospace", marginBottom: 25 }}>INSTALL</div><pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 23, lineHeight: 1.52, fontFamily: "Consolas, monospace", color: "#f6f5eb" }}><code>{snippet.slice(0, reveal)}<span style={{ color: colors.acid, opacity: frame % 20 < 10 ? 1 : 0 }}>|</span></code></pre><div style={{ position: "absolute", bottom: 48, left: 60, color: "#96988e", fontSize: 18 }}>Works as a custom element on any site.</div><div style={{ position: "absolute", right: 43, bottom: 20 }}><CharacterOrb label={characterName} scale={0.62} mood="awake" /></div></div></Browser></div>
    <div style={{ position: "absolute", right: 145, top: 412, width: 370, height: 455, border: `3px solid ${colors.ink}`, overflow: "hidden", background: "#e9e7db" }}>{screenshots.website ? <Img src={staticFile(screenshots.website)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><div style={{ padding: 35, fontSize: 26, fontWeight: 800, letterSpacing: "-0.06em" }}>{siteUrl}</div><div style={{ margin: "40px 35px", width: 200, height: 18, background: "#c9c7bc" }} /><div style={{ margin: "0 35px", width: 145, height: 18, background: "#c9c7bc" }} /><div style={{ position: "absolute", right: 20, bottom: 5 }}><CharacterOrb label={characterName} scale={0.55} mood="awake" /></div></>}</div>
  </div>;
};

export const ClosingScene = () => <div style={{ position: "relative", width: "100%", height: "100%", background: colors.ink, color: colors.paper, fontFamily: font, overflow: "hidden" }}><Grain /><Wordmark /><Reveal delay={5} style={{ position: "absolute", left: 150, top: 250, width: 1180 }}><div style={{ color: colors.acid, font: "700 18px monospace", marginBottom: 28 }}>OPEN SOURCE CHARACTER INFRASTRUCTURE</div><div style={{ fontSize: 103, lineHeight: 0.85, fontWeight: 800, letterSpacing: "-0.09em" }}>Cradle gives your product a character.<br />You decide what it becomes.</div></Reveal><div style={{ position: "absolute", left: 150, bottom: 92, display: "flex", alignItems: "center", gap: 22, font: "700 22px monospace" }}><span style={{ color: colors.acid }}>pnpm add @maranga/cradle</span><span style={{ color: "#74766c" }}>/</span><span>github.com/maranga/cradle</span></div><div style={{ position: "absolute", right: 150, bottom: 124 }}><CharacterOrb label="Cradle" scale={1.15} mood="awake" /></div></div>;
