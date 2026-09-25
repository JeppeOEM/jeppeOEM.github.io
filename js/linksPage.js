import DotBox from "./DotBox.js";
import AsciiLogoBackground from "./AsciiLogoBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";

export function linksPage() {
  const leftSection = document.getElementById("leftSection");
  const rightSection = document.getElementById("rightSection");
  const logoPre = document.querySelector(".center-pre");

  // side art repeated out from the logo to the window edges
  new AsciiLogoBackground({ leftSection, rightSection, leftPre, rightPre }).init();

  // dotted outline continuing out of the two `:` at the bottom of the logo
  const dotBox = new DotBox({
    logo: logoPre,
    box: document.querySelector(".dot-box"),
    outline: document.querySelector(".dot-box-outline"),
    content: document.querySelector(".dot-box-content"),
    // line work from the top of the logo, on the logo's own columns so its
    // feeder-analog columns land exactly under the `:` dropping from it; the
    // rows are mirror images about column 41, midway between the feeders
    header: [
      "        .                        - - ── ┐:┌ ── - -                        .",
      "        ┌ ── ─ ─                   :   ┌─:─┐   :                   ─ ─ ── ┐",
      "        |          .      ^.....┌ ─ ── | . | ── ─ ┐.....^      .          |",
      "    . ┌ ─                .... : |  |   : : :   |  | : ....                ─ ┐ .",
      "    : 1 │                 :   : .  1   . | .   1  . :   :                 │ 1 :",
      "    │  ²:                 ∙   ∙ :  :     │     :  : ∙   ∙                 :²  │",
    ],
    stepMs: 30,
    startDelay: 600,
  });
  dotBox.init();
  window.dotBox = dotBox;
  initDescriptionTruncation();
}

// Wraps each description so an ellipsis can show when it overflows, and
// marks overflowing ones .is-truncated (css/links.css expands them on hover).
function initDescriptionTruncation() {
  const spans = document.querySelectorAll('.dot-separation .span-green');
  const desktopQuery = window.matchMedia('(min-width: 501px)');

  spans.forEach((span) => {
    const textWrapper = document.createElement('span');
    textWrapper.className = 'span-green-text';
    textWrapper.append(...span.childNodes);

    const ellipsis = document.createElement('span');
    ellipsis.className = 'span-green-ellipsis';
    ellipsis.textContent = '...';
    ellipsis.setAttribute('aria-hidden', 'true');

    span.append(textWrapper, ellipsis);
  });

  const updateTruncation = () => {
    spans.forEach((span) => {
      const text = span.querySelector('.span-green-text');
      const isTruncated = desktopQuery.matches && text.scrollWidth > text.clientWidth + 1;
      span.classList.toggle('is-truncated', isTruncated);
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(updateTruncation);
  });

  window.addEventListener('resize', updateTruncation);
  desktopQuery.addEventListener('change', updateTruncation);
}
