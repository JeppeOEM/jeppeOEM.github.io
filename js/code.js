import AsciiCanvasBackground from "./AsciiCanvasBackground.js";
import AsciiBox from "./AsciiBox.js";
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

  const templateClosestChild = document.querySelector(".outer");
  const template = document.getElementById("outer-template");
  const asciiBox = new AsciiBox({
    templateClosestChild: templateClosestChild,
    template: template,
    mobileBreakpoint: {
      horizontalChars: 42,
      verticalLines: 10,
      verticalHeaderLines: 8,
      breakpoint: 480,
    },
    tabletBreakpoint: {
      horizontalChars: 60,
      verticalLines: 20,
      verticalHeaderLines: 0,
      breakpoint: 768,
    },
    desktopBreakpoint: {
      horizontalChars: 80,
      verticalHeaderLines: 0,
      verticalLines: 10,
    },
    styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 1500ms;
}
    .fade-in-box.show {
        /* Triggers the animation */
    }

    @keyframes fadeSlideScale {
        0% {
            opacity: 0;
            transform: translateY(200%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(0%) scale(0.5); /* Finished sliding, no scale yet */
        }
        100% {
            opacity: 1;
            transform: translateY(0%) scale(1); /* Scale up in place */
        }
    }
`,
  });

  asciiBox.init();
}
