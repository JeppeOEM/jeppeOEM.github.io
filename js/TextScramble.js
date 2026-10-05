/**
 * Decode text in: every character under `root` flickers through random
 * characters for a moment and then settles on its real one, in reading order.
 *
 * Each non-whitespace character is wrapped in a `.scramble-char` span while it
 * runs (whitespace is left as is, and the page font is monospace, so nothing
 * reflows). The span gets `on` when its character starts flickering and `done`
 * once it shows the real one; CSS decides what that looks like (css/code.css).
 * When every character is done the original text nodes are put back.
 *
 * @param {HTMLElement} root
 * @param {Object} [options]
 * @param {string} [options.charset]   Characters to flicker through
 * @param {number} [options.duration]  ms from the first character starting to the last
 * @param {number} [options.charLife]  ms each character flickers before settling
 * @param {number} [options.flicker]   Per-frame chance a flickering character changes
 * @returns {Promise<void>} resolves once the text is back to normal
 */
export function scrambleIn(root, options = {}) {
  const {
    charset = "0123456789abcdef",
    duration = 1200,
    charLife = 400,
    flicker = 0.5,
  } = options;
  const randomChar = () => charset[(Math.random() * charset.length) | 0];

  // collect first, then replace: the walker must not see the new spans
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim() !== "") textNodes.push(walker.currentNode);
  }

  /** @type {{node: Text, wrapper: HTMLElement}[]} */
  const replaced = [];
  /** @type {{span: HTMLElement, ch: string, state: number}[]} */
  const chars = [];
  for (const node of textNodes) {
    const wrapper = document.createElement("span");
    for (const part of node.nodeValue.split(/(\s+)/)) {
      if (part === "") continue;
      if (/^\s+$/.test(part)) {
        wrapper.appendChild(document.createTextNode(part));
        continue;
      }
      for (const ch of part) {
        const span = document.createElement("span");
        span.className = "scramble-char";
        span.textContent = ch;
        wrapper.appendChild(span);
        chars.push({ span, ch, state: 0 });
      }
    }
    node.replaceWith(wrapper);
    replaced.push({ node, wrapper });
  }

  const restore = () => {
    for (const { node, wrapper } of replaced) wrapper.replaceWith(node);
  };
  if (chars.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = duration / Math.max(chars.length - 1, 1);
    let left = chars.length;

    const frame = () => {
      // not rAF's timestamp: that is the frame's start, which can precede t0
      const t = performance.now() - t0;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c.state === 2) continue;
        const age = t - i * step;
        if (age < 0) break; // later characters start later still
        if (age >= charLife) {
          c.span.textContent = c.ch;
          c.span.classList.add("done");
          c.state = 2;
          left--;
          continue;
        }
        if (c.state === 0) {
          c.span.classList.add("on");
          c.span.textContent = randomChar();
          c.state = 1;
        } else if (Math.random() < flicker) {
          c.span.textContent = randomChar();
        }
      }
      if (left > 0) {
        requestAnimationFrame(frame);
      } else {
        restore();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
