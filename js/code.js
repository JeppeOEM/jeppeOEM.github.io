import BinaryStreamSections from "./BinaryStreamSections.js";
import P5Background from "./P5Background.js";
import { animations } from "./animations/index.js";

export function codePage() {
  // p5 canvas behind the page; which animation runs comes from ?anim=<name>
  // (see js/animations/index.js for the names), default asciiScramble.
  const wanted = new URLSearchParams(location.search).get("anim");
  const bodyBackground = new P5Background({
    animations,
    initial: wanted && animations[wanted] ? wanted : "asciiScramble",
    container: document.body,
    colors: {
      base: "var(--dark-green)",
      highlight: "var(--light-green)",
    },
    zIndex: -1,
    frameRate: 30,
    // nothing is drawn behind these elements
    exclude: [".text-box"],
    excludePadding: 1,
  });
  bodyBackground.init();
  // console: p5Background.list(), p5Background.run("hexRain"), p5Background.next()
  window.p5Background = bodyBackground;

  // 0/1 rows beside the logo tick left as one stream passing under it
  const binaryStream = new BinaryStreamSections({
    sections: [
      document.getElementById("leftSection"),
      document.getElementById("rightSection"),
    ],
    // the 0/1 inside the logo show the same stream at their own columns
    logo: document.querySelector(".center-pre"),
    logoZeroClass: "code-logo-color-2",
    logoOneClass: "code-logo-color-5",
    stepMs: 450,
    streamRows: 3,
    blankLines: 4,
  });
  binaryStream.init();
  window.binaryStream = binaryStream;
}
