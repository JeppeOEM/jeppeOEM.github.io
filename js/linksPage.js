import DotBox from "./DotBox.js";
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

  // dotted outline continuing out of the two `:` at the bottom of the logo
  const dotBox = new DotBox({
    logo: logoPre,
    box: document.querySelector(".dot-box"),
    outline: document.querySelector(".dot-box-outline"),
    content: document.querySelector(".dot-box-content"),
    // line work from the top of the logo, on the logo's own columns so its
    // feeder-analog columns land exactly under the `:` dropping from it
    header: [
      "    .                           - - ── ┐:┌ ── - -                         .",
      "    ┌ ── ─ ─                      :   ┌─:─┐   :                    ─ ─ ── ┐",
      "    |             .      ^.....┌ ─ ── | . | ── ─ ┐ ....^                  |",
      ". ┌ ─                   .... : |  |   : : :      | : ....        ─        ─ ┐ .",
      ": 1 │                    :   : .  1   . | .      1 :   :           .      │ 1 :",
      "│  ²:                 ∙   ∙ :  :     │        : .   .           :      :²  │",
    ],
    stepMs: 30,
    startDelay: 600,
  });
  dotBox.init();
  window.dotBox = dotBox;
  initPinkSpanOverflowBehavior();

  // colorWordStartsInDotSeperationBrackets();
}

function initPinkSpanOverflowBehavior() {
  const spans = document.querySelectorAll('.dot-seperation .span-green');
  const desktopQuery = window.matchMedia('(min-width: 501px)');

  spans.forEach((span) => {
    if (!span.querySelector('.span-green-text')) {
      const textWrapper = document.createElement('span');
      textWrapper.className = 'span-green-text';

      const nodesToMove = [];
      span.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          nodesToMove.push(node);
        }
      });

      nodesToMove.forEach((node) => textWrapper.appendChild(node));
      span.appendChild(textWrapper);
    }

    if (!span.querySelector('.span-green-ellipsis')) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'span-green-ellipsis';
      ellipsis.textContent = '...';
      ellipsis.setAttribute('aria-hidden', 'true');
      span.appendChild(ellipsis);
    }
  });

  const updateTruncation = () => {
    spans.forEach((span) => {
      span.classList.remove('is-truncated');
      const textWrapper = span.querySelector('.span-green-text');
      if (!textWrapper) return;

      if (!desktopQuery.matches) {
        return;
      }

      const isTruncated = textWrapper.scrollWidth > textWrapper.clientWidth + 1;
      if (isTruncated) {
        span.classList.add('is-truncated');
      }
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(updateTruncation);
  });

  window.addEventListener('resize', updateTruncation);
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', updateTruncation);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(updateTruncation);
  }
}

function colorWordStartsInDotSeperationBrackets() {
  const spans = document.querySelectorAll('.dot-seperation .color-span, .dot-seperation .span-green');
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
