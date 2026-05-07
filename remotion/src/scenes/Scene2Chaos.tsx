import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const body = loadFont("normal", { weights: ["500", "700"] });

const messages = [
  { text: "Co dzisiaj na obiad? 🍝", x: 8, y: 12, rot: -4, delay: 0 },
  { text: "Kupisz mleko?", x: 52, y: 22, rot: 3, delay: 10 },
  { text: "Ja zrobiłem pranie", x: 12, y: 36, rot: -2, delay: 20 },
  { text: "Kiedy odkurzanie?", x: 48, y: 48, rot: 5, delay: 30 },
  { text: "Płacisz rachunki?", x: 6, y: 62, rot: -3, delay: 40 },
  { text: "Wyrzucisz śmieci? 🗑️", x: 50, y: 72, rot: 2, delay: 50 },
  { text: "Zapomniałam o myciu", x: 14, y: 84, rot: -5, delay: 60 },
];

export const Scene2Chaos = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {messages.map((m, i) => {
        const s = spring({ frame: frame - m.delay, fps, config: { damping: 12 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${m.x}%`,
              top: `${m.y}%`,
              background: "white",
              padding: "24px 36px",
              borderRadius: 28,
              boxShadow: "0 12px 40px rgba(233,69,96,0.18)",
              fontFamily: `${body.fontFamily}, NotoColorEmoji`,
              fontWeight: 600,
              fontSize: 38,
              color: "#1F1B16",
              opacity: s,
              transform: `scale(${s}) rotate(${m.rot}deg)`,
              border: "2px solid rgba(233,69,96,0.15)",
            }}
          >
            {m.text}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: `${body.fontFamily}, NotoColorEmoji`,
          fontSize: 56,
          fontWeight: 700,
          color: "#9A4437",
          opacity: interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Znacie to? 😅
      </div>
    </AbsoluteFill>
  );
};