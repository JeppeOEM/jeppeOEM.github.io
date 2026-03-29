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
    backgroundColor: "var(--blue)",
    outlineColor: "var(--light-black)",
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

  // colorWordStartsInDotSeperationBrackets();
}

function colorWordStartsInDotSeperationBrackets() {
  const spans = document.querySelectorAll('.dot-seperation .color-span, .dot-seperation .span-purple');
  const colorClasses = ['edge-letter-c1', 'edge-letter-c2', 'edge-letter-c3', 'edge-letter-c4'];

  spans.forEach((span) => {
    // Make recoloring idempotent by unwrapping previous color wrappers.
    span
      .querySelectorAll('.word-letter-1, .word-letter-2, .edge-letter-c1, .edge-letter-c2, .edge-letter-c3, .edge-letter-c4')
      .forEach((el) => {
        el.replaceWith(document.createTextNode(el.textContent || ''));
      });

    const textNodes = [];
    const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const p = node.parentElement;
      if (!p) continue;
      if (p.closest('.span-second-accent')) continue;
      if (!node.textContent) continue;
      textNodes.push(node);
    }

    const letterRefs = [];
    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      for (let i = 0; i < text.length; i++) {
        if (/[a-zA-Z]/.test(text[i])) {
          letterRefs.push({ textNode, charIndex: i });
        }
      }
    });

    if (!letterRefs.length) return;

    const stylesByNode = new Map();
    const firstCount = Math.min(4, letterRefs.length);
    const lastCount = Math.min(4, letterRefs.length);

    const setStyle = (ref, className) => {
      if (!stylesByNode.has(ref.textNode)) {
        stylesByNode.set(ref.textNode, new Map());
      }
      const nodeStyleMap = stylesByNode.get(ref.textNode);
      if (!nodeStyleMap.has(ref.charIndex)) {
        nodeStyleMap.set(ref.charIndex, className);
      }
    };

    for (let i = 0; i < firstCount; i++) {
      setStyle(letterRefs[i], colorClasses[i]);
    }

    for (let i = 0; i < lastCount; i++) {
      const ref = letterRefs[letterRefs.length - lastCount + i];
      setStyle(ref, colorClasses[lastCount - 1 - i]);
    }

    textNodes.forEach((textNode) => {
      const nodeStyleMap = stylesByNode.get(textNode);
      if (!nodeStyleMap || nodeStyleMap.size === 0) return;

      const text = textNode.textContent;
      const frag = document.createDocumentFragment();
      let plain = '';

      for (let i = 0; i < text.length; i++) {
        const className = nodeStyleMap.get(i);
        if (!className) {
          plain += text[i];
          continue;
        }

        if (plain) {
          frag.appendChild(document.createTextNode(plain));
          plain = '';
        }

        const s = document.createElement('span');
        s.className = className;
        s.textContent = text[i];
        frag.appendChild(s);
      }

      if (plain) {
        frag.appendChild(document.createTextNode(plain));
      }

      textNode.parentNode.replaceChild(frag, textNode);
    });
  });
}
