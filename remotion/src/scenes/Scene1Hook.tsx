import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadHeading } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const heading = loadHeading("normal", { weights: ["700", "900"] });
const body = loadBody("normal", { weights: ["400", "600"] });

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ frame, fps, config: { damping: 14 } });
  const line2 = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const line3 = spring({ frame: frame - 36, fps, config: { damping: 14 } });
  const heart = spring({ frame: frame - 50, fps, config: { damping: 8 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ fontFamily: body.fontFamily, fontSize: 44, fontWeight: 600, color: "#9A4437", letterSpacing: 4, textTransform: "uppercase", opacity: inSpring, transform: `translateY(${interpolate(inSpring, [0,1], [30,0])}px)` }}>
        Mieszkacie razem?
      </div>
      <div style={{ fontFamily: heading.fontFamily, fontSize: 150, fontWeight: 900, color: "#1F1B16", lineHeight: 1.0, marginTop: 40, textAlign: "center", opacity: line2, transform: `translateY(${interpolate(line2,[0,1],[60,0])}px)` }}>
        Kto kupi
      </div>
      <div style={{ fontFamily: heading.fontFamily, fontSize: 150, fontWeight: 900, color: "#E94560", lineHeight: 1.0, fontStyle: "italic", textAlign: "center", opacity: line3, transform: `translateY(${interpolate(line3,[0,1],[60,0])}px) rotate(${interpolate(line3,[0,1],[-3,0])}deg)` }}>
        chleb?
      </div>
      <div style={{ fontSize: 200, marginTop: 30, transform: `scale(${heart}) rotate(${interpolate(frame,[50,100],[0,15])}deg)` }}>
        🤷‍♀️
      </div>
    </AbsoluteFill>
  );
};