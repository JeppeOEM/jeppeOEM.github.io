import AsciiCanvasBackground from "./AsciiCanvasBackground.js";
import BinaryStreamSections from "./BinaryStreamSections.js";

import { patterns } from "./asciiPatterns.js";

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

  // 0/1 rows beside the logo tick left as one stream passing under it
  const binaryStream = new BinaryStreamSections({
    sections: [
      document.getElementById("leftSection"),
      document.getElementById("rightSection"),
    ],
    stepMs: 150,
    streamRows: 3,
    blankLines: 4,
  });
  binaryStream.init();
  window.binaryStream = binaryStream;
}
