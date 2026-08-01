import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ClosingScene, ConnectScene, LiveSiteScene, OpeningScene, ReviewScene, ShapeScene } from "../scenes";

export type CradleLaunchProps = {
  siteName: string;
  siteUrl: string;
  characterName: string;
  narrationSrc?: string;
  screenshots?: {
    studio?: string;
    website?: string;
  };
};

/** The primary 42-second product film for Cradle. */
export const CradleLaunch = ({ narrationSrc, ...props }: CradleLaunchProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#10110d" }}>
      {narrationSrc ? <Audio src={staticFile(narrationSrc)} volume={0.95} /> : null}

      {/* 01: Opening Teaser (0 - 5s / 150f) */}
      <Sequence from={0} durationInFrames={150} premountFor={30}>
        <OpeningScene />
      </Sequence>

      {/* 02: Connect & Crawl (5 - 13s / 240f) */}
      <Sequence from={150} durationInFrames={240} premountFor={30}>
        <ConnectScene {...props} />
      </Sequence>

      {/* 03: Review Knowledge (13 - 21s / 240f) */}
      <Sequence from={390} durationInFrames={240} premountFor={30}>
        <ReviewScene />
      </Sequence>

      {/* 04: Shape & Companion (21 - 29s / 240f) */}
      <Sequence from={630} durationInFrames={240} premountFor={30}>
        <ShapeScene {...props} />
      </Sequence>

      {/* 05: Live Customer Site (29 - 36s / 210f) */}
      <Sequence from={870} durationInFrames={210} premountFor={30}>
        <LiveSiteScene />
      </Sequence>

      {/* 06: Closing CTA Outro (36 - 42s / 180f) */}
      <Sequence from={1080} durationInFrames={180} premountFor={30}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
