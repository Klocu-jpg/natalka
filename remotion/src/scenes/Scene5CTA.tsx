import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadH } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadB } from "@remotion/google-fonts/Inter";

const heading = loadH("normal", { weights: ["900"] });
const body = loadB("normal", { weights: ["500", "700", "800"] });

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t1 = spring({ frame, fps, config: { damping: 14 } });
  const t2 = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const t3 = spring({ frame: frame - 38, fps, config: { damping: 10 } });
  const t4 = spring({ frame: frame - 60, fps, config: { damping: 14 } });
  const heartScale = 1 + Math.sin(frame / 8) * 0.06;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ fontSize: 180, transform: `scale(${t1 * heartScale})`, marginBottom: 30 }}>❤️</div>
      <div style={{ fontFamily: heading.fontFamily, fontSize: 130, fontWeight: 900, color: "#1F1B16", textAlign: "center", lineHeight: 0.95, opacity: t2, transform: `translateY(${interpolate(t2,[0,1],[40,0])}px)` }}>
        Spróbujcie<br/>
        <span style={{ color: "#E94560", fontStyle: "italic" }}>za darmo</span>
      </div>
      <div
        style={{
          marginTop: 60,
          background: "linear-gradient(135deg, #E94560 0%, #FF8A80 100%)",
          padding: "40px 80px",
          borderRadius: 100,
          fontFamily: body.fontFamily,
          fontWeight: 800,
          fontSize: 60,
          color: "white",
          boxShadow: "0 20px 60px rgba(233,69,96,0.45)",
          opacity: t3,
          transform: `scale(${t3})`,
        }}
      >
        14 dni gratis
      </div>
      <div style={{ fontFamily: body.fontFamily, fontSize: 50, fontWeight: 700, color: "#1F1B16", marginTop: 80, opacity: t4 }}>
        loversapp.lovable.app
      </div>
      <div style={{ fontFamily: body.fontFamily, fontSize: 32, color: "#9A4437", marginTop: 16, opacity: t4 }}>
        Anuluj kiedy chcesz
      </div>
    </AbsoluteFill>
  );
};