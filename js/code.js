import AsciiBackground from "./AsciiBackground.js"
import AsciiBox from "./AsciiBox.js"
import AsciiLogoBackground from "./AsciiLogoBackground.js"

import { patterns } from "./asciiPatterns.js"
import { startBinaryAnimation } from "./binaryAnimation.js";
import { leftPre, rightPre } from "./codeBackground.js";

export function codePage() {

  const bodyBackground = new AsciiBackground({
    asciiArt: patterns.pattern1,
    container: document.body,
    style: {
      color: 'var(--dark-green)',
      opacity: 1,
      zIndex: -1
    }
  });

  if (bodyBackground) {
    const background = document.querySelector(".ascii-background")
    background.classList.add("fade-in-bg")
  }


  const leftSection = document.getElementById('leftSection');
  const rightSection = document.getElementById('rightSection');
  const logoPre = document.querySelector('.center-pre')
  console.log(leftSection, rightSection)
  const logoBackground = new AsciiLogoBackground({
    leftSection: leftSection,
    rightSection: rightSection,
    leftPre: leftPre,
    rightPre: rightPre,
    logoPre: logoPre
  })

  logoBackground.fillSections()
  logoBackground.init()


  const templateClosestChild = document.querySelector('.outer')
  const template = document.getElementById('outer-template')
  const asciiBox = new AsciiBox({
    templateClosestChild: templateClosestChild,
    template: template,
    mobileBreakpoint: {
      horizontalChars: 42,
      verticalLines: 20,
      breakpoint: 480
    },
    tabletBreakpoint: {
      horizontalChars: 42,
      verticalLines: 20,
      breakpoint: 481
    },
    desktopBreakpoint: {
      horizontalChars: 80,
      verticalLines: 10
    },
    delay: 8800,
    styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 3500ms; /* 4 second delay */
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
`
  })

  asciiBox.init()



  const leftDiv = document.querySelector('.leftDiv');
  startBinaryAnimation(leftDiv, 3, 600);

  const topLeftDiv = document.querySelector('.topLeftDiv');
  startBinaryAnimation(topLeftDiv, 3, 800);

  const bottomLeftDiv = document.querySelector('.bottomLeftDiv');
  startBinaryAnimation(bottomLeftDiv, 3, 900);

}
