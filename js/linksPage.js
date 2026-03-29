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

  colorWordStartsInDotSeperationBrackets();
}

function colorWordStartsInDotSeperationBrackets() {
  const spans = document.querySelectorAll('.dot-seperation .span-purple');
  const textNodes = [];

  spans.forEach((span) => {
    const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const p = node.parentElement;
      if (!p) continue;
      if (p.closest('.span-second-accent')) continue;
      if (!node.textContent.trim()) continue;
      textNodes.push(node);
    }
  });

  textNodes.forEach((textNode) => {
    const text = textNode.textContent;
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      const isLetter = /[a-zA-Z]/.test(char);
      const prevIsLetter = i > 0 && /[a-zA-Z]/.test(text[i - 1]);
      if (isLetter && !prevIsLetter) {
        const s1 = document.createElement('span');
        s1.className = 'word-letter-1';
        s1.textContent = char;
        frag.appendChild(s1);
        i++;
        if (i < text.length && /[a-zA-Z]/.test(text[i])) {
          const s2 = document.createElement('span');
          s2.className = 'word-letter-2';
          s2.textContent = text[i];
          frag.appendChild(s2);
          i++;
        }
      } else {
        let plain = '';
        while (i < text.length) {
          const c = text[i];
          const isL = /[a-zA-Z]/.test(c);
          const prevIsL = i > 0 && /[a-zA-Z]/.test(text[i - 1]);
          if (isL && !prevIsL) break;
          plain += c;
          i++;
        }
        frag.appendChild(document.createTextNode(plain));
      }
    }
    textNode.parentNode.replaceChild(frag, textNode);
  });
}
