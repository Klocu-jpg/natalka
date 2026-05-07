import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadH } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadB } from "@remotion/google-fonts/Inter";

const heading = loadH("normal", { weights: ["900"] });
const body = loadB("normal", { weights: ["500", "700"] });

export const Scene3Reveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t1 = spring({ frame, fps, config: { damping: 14 } });
  const t2 = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const t3 = spring({ frame: frame - 40, fps, config: { damping: 10 } });
  const t4 = spring({ frame: frame - 65, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ fontFamily: body.fontFamily, fontSize: 50, fontWeight: 600, color: "#9A4437", opacity: t1, transform: `translateY(${interpolate(t1,[0,1],[30,0])}px)` }}>
        Poznajcie
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30, opacity: t2, transform: `scale(${t2})` }}>
        <div style={{ fontSize: 140 }}>💕</div>
      </div>
      <div style={{ fontFamily: heading.fontFamily, fontSize: 200, fontWeight: 900, color: "#E94560", lineHeight: 1, marginTop: 20, opacity: t3, transform: `scale(${interpolate(t3,[0,1],[0.6,1])})` }}>
        LoveApp
      </div>
      <div style={{ fontFamily: body.fontFamily, fontSize: 44, fontWeight: 500, color: "#1F1B16", textAlign: "center", maxWidth: 800, marginTop: 50, lineHeight: 1.3, opacity: t4, transform: `translateY(${interpolate(t4,[0,1],[30,0])}px)` }}>
        Wszystko, czego potrzebujecie<br/>razem — w jednej apce.
      </div>
    </AbsoluteFill>
  );
};