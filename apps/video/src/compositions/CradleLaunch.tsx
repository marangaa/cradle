import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Audio, staticFile } from "remotion";
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

/**
 * The primary product film for Cradle.
 * Total frames: ~1260 (42 seconds at 30fps)
 */
export const CradleLaunch = ({ narrationSrc, ...props }: CradleLaunchProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {narrationSrc ? <Audio src={staticFile(narrationSrc)} volume={0.95} /> : null}

      <TransitionSeries>
        {/* 01: The Hook (0 - 5s) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <OpeningScene />
        </TransitionSeries.Sequence>
        
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

        {/* 02: The Reveal (5 - 12s) */}
        <TransitionSeries.Sequence durationInFrames={225}>
          <ConnectScene />
        </TransitionSeries.Sequence>
        
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

        {/* 03: The Workflow - Connect (12 - 18s) */}
        <TransitionSeries.Sequence durationInFrames={195}>
          <ReviewScene />
        </TransitionSeries.Sequence>
        
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

        {/* 04: The Workflow - Shape (18 - 24s) */}
        <TransitionSeries.Sequence durationInFrames={195}>
          <ShapeScene />
        </TransitionSeries.Sequence>
        
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

        {/* 05: The Workflow - Live Site (24 - 30s) */}
        <TransitionSeries.Sequence durationInFrames={195}>
          <LiveSiteScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

        {/* 06: Outro (30 - 36s) */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
