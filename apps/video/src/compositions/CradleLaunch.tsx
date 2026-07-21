import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ClosingScene, ConnectScene, OpeningScene, ShapeScene, InstallScene } from "../scenes";

export type CradleLaunchProps = {
  siteName: string;
  siteUrl: string;
  characterName: string;
  narrationSrc?: string;
  screenshots: {
    studio?: string;
    website?: string;
  };
};

/** The primary 42-second product film for Cradle. */
export const CradleLaunch = ({ narrationSrc, ...props }: CradleLaunchProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#10110d" }}>
      {narrationSrc ? <Audio src={staticFile(narrationSrc)} volume={0.95} /> : null}
      <Sequence from={0} durationInFrames={150} premountFor={30}>
        <OpeningScene />
      </Sequence>
      <Sequence from={150} durationInFrames={240} premountFor={30}>
        <ConnectScene {...props} />
      </Sequence>
      <Sequence from={390} durationInFrames={270} premountFor={30}>
        <ShapeScene {...props} />
      </Sequence>
      <Sequence from={660} durationInFrames={300} premountFor={30}>
        <InstallScene {...props} />
      </Sequence>
      <Sequence from={960} durationInFrames={300} premountFor={30}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
