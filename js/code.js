import AsciiCanvasBackground from "./AsciiCanvasBackground.js";
import AsciiLogoBackground from "./AsciiLogoBackground.js";

import { patterns } from "./asciiPatterns.js";
import { leftPre, rightPre } from "./codeBackground.js";

export function codePage() {
  const bodyBackground = new AsciiCanvasBackground({
    asciiArt: patterns.pattern1,
    container: document.body,
    style: {
      color: "var(--dark-green)",
      highlight: "var(--light-green)",
      opacity: 1,
      zIndex: -1,
    },
    charset: "0123456789abcdef",
    radius: 48,
    restoreAfter: 1500,
    // no characters are drawn behind these elements
    exclude: [".text-box"],
    excludePadding: 1,
  });
  window.asciiBackground = bodyBackground;

  const leftSection = document.getElementById("leftSection");
  const rightSection = document.getElementById("rightSection");
  const logoPre = document.querySelector(".center-pre");
  console.log(leftSection, rightSection);
  const logoBackground = new AsciiLogoBackground({
    leftSection: leftSection,
    rightSection: rightSection,
    leftPre: leftPre,
    rightPre: rightPre,
    logoPre: logoPre,
  });

  logoBackground.fillSections();
  logoBackground.init();
}
