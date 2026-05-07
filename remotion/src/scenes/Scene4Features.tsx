import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadH } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadB } from "@remotion/google-fonts/Inter";

const heading = loadH("normal", { weights: ["800"] });
const body = loadB("normal", { weights: ["500", "700"] });

const features = [
  { emoji: "🛒", title: "Lista zakupów", desc: "Wspólnie, na żywo" },
  { emoji: "🍝", title: "Planer obiadów", desc: "Z AI i przepisami" },
  { emoji: "✅", title: "Obowiązki domowe", desc: "Bez kłótni o śmieci" },
  { emoji: "📅", title: "Wspólny kalendarz", desc: "Ważne daty razem" },
  { emoji: "💰", title: "Wspólne oszczędności", desc: "Cele i wydatki" },
  { emoji: "📸", title: "Albumy zdjęć", desc: "Wasze wspomnienia" },
];

export const Scene4Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ padding: 80, paddingTop: 130 }}>
      <div style={{ fontFamily: heading.fontFamily, fontSize: 90, fontWeight: 800, color: "#1F1B16", textAlign: "center", lineHeight: 1, opacity: titleS, transform: `translateY(${interpolate(titleS,[0,1],[30,0])}px)` }}>
        Wszystko <span style={{ color: "#E94560", fontStyle: "italic" }}>w jednym</span> miejscu
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginTop: 80 }}>
        {features.map((f, i) => {
          const s = spring({ frame: frame - 20 - i * 10, fps, config: { damping: 14 } });
          return (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 32,
                padding: 36,
                boxShadow: "0 16px 50px rgba(233,69,96,0.15)",
                opacity: s,
                transform: `translateY(${interpolate(s,[0,1],[60,0])}px) scale(${interpolate(s,[0,1],[0.9,1])})`,
                border: "2px solid rgba(233,69,96,0.08)",
              }}
            >
              <div style={{ fontSize: 80 }}>{f.emoji}</div>
              <div style={{ fontFamily: heading.fontFamily, fontSize: 42, fontWeight: 800, color: "#1F1B16", marginTop: 8 }}>
                {f.title}
              </div>
              <div style={{ fontFamily: body.fontFamily, fontSize: 28, color: "#9A4437", marginTop: 6 }}>
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};