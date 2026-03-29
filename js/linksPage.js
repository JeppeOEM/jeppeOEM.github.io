import AsciiBox from "./AsciiBox.js";
import AsciiLogoBackground from "./AsciiLogoBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";
import { patterns } from "./asciiPatterns.js";
import AsciiBackground from "./AsciiBackground.js";
export function linksPage() {
  const leftSection = document.getElementById('leftSection');
  const rightSection = document.getElementById('rightSection');
  const logoPre = document.querySelector('.center-pre');
  console.log(leftSection, rightSection);

  // const bodyBackground = new AsciiBackground({
  //  asciiArt: patterns.dotPattern,
  //  container: document.body,
  //  style: {
  //    color: "var(--dark-grey)",
  //    opacity: 1,
  //    zIndex: -1,
  //  },
  // });

  // if (bodyBackground) {
  //  const background = document.querySelector(".ascii-background");
  //  background.classList.add("fade-in-bg");
  // }

  const logoBackground = new AsciiLogoBackground({
    leftSection: leftSection,
    rightSection: rightSection,
    leftPre: leftPre,
    rightPre: rightPre,
    logoPre: logoPre
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
      verticalLines: 50,
      verticalHeaderLines: 8,
      breakpoint: 480,
    },
    tabletBreakpoint: {
      horizontalChars: 60,
      verticalLines: 50,
      verticalHeaderLines: 0,
      breakpoint: 768,
    },
    desktopBreakpoint: {
      horizontalChars: 80,
      verticalHeaderLines: 0,
      verticalLines: 30,
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
