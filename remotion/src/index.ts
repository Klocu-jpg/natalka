import { registerRoot, staticFile } from "remotion";
import { RemotionRoot } from "./Root";

const emojiFont = new FontFace(
  "NotoColorEmoji",
  `url(${staticFile("fonts/NotoColorEmoji.ttf")})`
);
emojiFont.load().then((f) => {
  // @ts-ignore
  document.fonts.add(f);
});

registerRoot(RemotionRoot);