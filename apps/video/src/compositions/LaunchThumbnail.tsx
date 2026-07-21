import { AbsoluteFill } from "remotion";
import { CharacterOrb, Grain, Wordmark } from "../scenes";
import type { CradleLaunchProps } from "./CradleLaunch";

/** Still thumbnail paired with the launch composition. */
export const LaunchThumbnail = ({ characterName }: CradleLaunchProps) => {
  return (
    <AbsoluteFill style={{ background: "#10110d", color: "#f6f5eb", overflow: "hidden" }}>
      <Grain />
      <Wordmark />
      <div style={{ margin: "200px 0 0 150px", width: 970, fontSize: 104, fontWeight: 800, letterSpacing: "-0.08em", lineHeight: 0.91 }}>
        Give your product a character.
      </div>
      <div style={{ position: "absolute", right: 178, bottom: 105 }}>
        <CharacterOrb label={characterName} scale={1.55} />
      </div>
    </AbsoluteFill>
  );
};
