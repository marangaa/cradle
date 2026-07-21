import { Composition, Still } from "remotion";
import { CradleLaunch, type CradleLaunchProps } from "./compositions/CradleLaunch";
import { LaunchThumbnail } from "./compositions/LaunchThumbnail";

const fps = 30;

const defaultProps = {
  siteName: "Qualra",
  siteUrl: "qualra.xyz",
  characterName: "Byte Bunny",
  narrationSrc: "video/audio/cradle-narration.mp3",
  screenshots: {},
} satisfies CradleLaunchProps;

/** Registers the product-film compositions available in Remotion Studio. */
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="CradleLaunch"
        component={CradleLaunch}
        durationInFrames={42 * fps}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      <Still id="LaunchThumbnail" component={LaunchThumbnail} width={1920} height={1080} defaultProps={defaultProps} />
    </>
  );
};
