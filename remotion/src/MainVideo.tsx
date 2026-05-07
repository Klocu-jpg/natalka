import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Chaos } from "./scenes/Scene2Chaos";
import { Scene3Reveal } from "./scenes/Scene3Reveal";
import { Scene4Features } from "./scenes/Scene4Features";
import { Scene5CTA } from "./scenes/Scene5CTA";

const PersistentBg = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 60]);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #FFE4D6 0%, #FFF5EE 40%, #FFEAD6 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,138,128,0.35) 0%, rgba(255,138,128,0) 70%)",
          top: -200 + drift,
          left: -200,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,114,182,0.28) 0%, rgba(244,114,182,0) 70%)",
          bottom: -300 - drift,
          right: -300,
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBg />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene2Chaos />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene3Reveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};