import { registerRoot, staticFile, delayRender, continueRender } from "remotion";
import { RemotionRoot } from "./Root";

const handle = delayRender("emoji-font");
const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'NotoColorEmoji';
    src: url('${staticFile("fonts/NotoColorEmoji.ttf")}') format('truetype');
    font-display: block;
  }
  body { font-family: 'NotoColorEmoji'; }
`;
document.head.appendChild(style);
const f = new FontFace("NotoColorEmoji", `url(${staticFile("fonts/NotoColorEmoji.ttf")})`);
f.load().then((loaded) => {
  // @ts-ignore
  document.fonts.add(loaded);
  continueRender(handle);
}).catch(() => continueRender(handle));

registerRoot(RemotionRoot);