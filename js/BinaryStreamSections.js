/**
 * Fills the two sections flanking the code-page logo and animates the
 * rows of 0/1 in them as a character ticker: every `stepMs` the rows shift
 * one character to the left and a fresh random bit enters at the far right.
 *
 * The two sides share one buffer per row, so a bit that slides out of the
 * right-hand section at the logo edge is hidden for as many ticks as the
 * logo is wide and then re-appears at the logo edge of the left-hand
 * section: one stream passing underneath the logo.
 *
 * When a `logo` element is given, every cell on the stream rows of the logo
 * that is not part of the lettering (the original 0/1 digits and the blank
 * spaces) is wrapped in a span and shows the buffer bit at its own column.
 * The bits therefore flow visibly through the dark areas around the `$`
 * letters. The buffer is seeded with the logo's original digits.
 *
 * Sides are identified by measured position, not by element id, because
 * in code.html the element called "rightSection" is displayed on the left.
 */
export default class BinaryStreamSections {
  /**
   * @param {Object} config
   * @param {HTMLElement[]} config.sections   The two side containers, any order
   * @param {number} [config.stepMs=150]      Milliseconds per one-character shift
   * @param {number} [config.streamRows=3]    Number of moving 0/1 rows
   * @param {number} [config.blankLines=4]    Empty lines above the art (vertical alignment)
   * @param {string} [config.staticClass]     Class for the y/$ rows
   * @param {string} [config.streamClass]     Class for the 0/1 rows
   * @param {string} [config.oneClass]        Class wrapping runs of 1 in the side rows
   * @param {number} [config.oneProbability]  Chance that a new bit is a 1 (default 0.3)
   * @param {HTMLElement} [config.logo]       Logo pre whose 0/1 digits join the stream
   * @param {string} [config.logoZeroClass]   Class for a 0 inside the logo
   * @param {string} [config.logoOneClass]    Class for a 1 inside the logo
   */
  constructor(config) {
    this.sections = config.sections;
    this.stepMs = config.stepMs ?? 150;
    this.streamRows = config.streamRows ?? 3;
    this.blankLines = config.blankLines ?? 4;
    this.staticClass = config.staticClass || "code-logo-color-3";
    this.streamClass = config.streamClass || "black-bg";
    // Like the logo art: 1 is drawn brighter than 0, and 1s are the minority.
    this.oneClass = config.oneClass || "code-logo-color-5";
    this.oneProbability = config.oneProbability ?? 0.3;
    this.logo = config.logo || null;
    this.logoZeroClass = config.logoZeroClass || "code-logo-color-2";
    this.logoOneClass = config.logoOneClass || "code-logo-color-5";
    /** @type {HTMLSpanElement[]|null} digit spans inside the logo, wrapped once */
    this.logoSpans = null;
    /** @type {{span: HTMLSpanElement, row: number, col: number}[]} */
    this.logoBits = [];
    this.logoSeeded = false;

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /** @type {string[]} one string per stream row, spanning left + gap + right */
    this.rows = [];
    this.leftCols = 0;
    this.gapCols = 0;
    this.rightCols = 0;
    /** @type {{el: HTMLElement, pre: HTMLPreElement, spans: HTMLSpanElement[]}[]} */
    this.sides = [];

    this.rafId = 0;
    this.lastTime = 0;
    this.accumulated = 0;

    this.tick = this.tick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  init() {
    document.fonts.ready.then(() => {
      this.build();
      this.render();
      if (!this.reducedMotion) this.start();
    });

    window.addEventListener("resize", this.onResize);

    // The font selector changes body's inline font-family; rebuild for new metrics.
    this.fontObserver = new MutationObserver(() => this.onResize());
    this.fontObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  /** Width of one character in the section's font, in pixels. */
  measureCharWidth(section) {
    const probe = document.createElement("span");
    probe.textContent = "0000000000";
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      whiteSpace: "pre",
    });
    section.appendChild(probe);
    const width = probe.getBoundingClientRect().width / 10;
    probe.remove();
    return width || 8;
  }

  /** Sort the sections into visual left and right, measure, build the DOM. */
  build() {
    const ordered = [...this.sections].sort(
      (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left
    );
    const [leftEl, rightEl] = ordered;

    const charW = this.measureCharWidth(leftEl);
    const leftRect = leftEl.getBoundingClientRect();
    const rightRect = rightEl.getBoundingClientRect();

    this.leftCols = Math.max(0, Math.floor(leftRect.width / charW));
    this.rightCols = Math.max(0, Math.floor(rightRect.width / charW));
    this.gapCols = Math.max(
      0,
      Math.round((rightRect.left - leftRect.right) / charW)
    );

    this.resizeBuffers(this.leftCols + this.gapCols + this.rightCols);

    this.sides = [
      this.buildSide(leftEl, "code-logo-left", this.leftCols),
      this.buildSide(rightEl, "code-logo-right", this.rightCols),
    ];

    if (this.logo) this.locateLogoBits(leftEl, charW);
  }

  /**
   * Wrap every 0, 1 and plain space inside the logo in its own span (once)
   * and return the spans in document order. Spans that turn out not to sit
   * on a stream row are unwrapped again by locateLogoBits().
   */
  wrapLogoDigits() {
    if (this.logoSpans) return this.logoSpans;
    const walker = document.createTreeWalker(this.logo, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (/[01 ]/.test(node.nodeValue)) textNodes.push(node);
    }

    const spans = [];
    for (const textNode of textNodes) {
      const frag = document.createDocumentFragment();
      let run = "";
      const flush = () => {
        if (run) frag.appendChild(document.createTextNode(run));
        run = "";
      };
      for (const ch of textNode.nodeValue) {
        if (ch === "0" || ch === "1" || ch === " ") {
          flush();
          const span = document.createElement("span");
          span.className = "stream-bit";
          span.textContent = ch;
          frag.appendChild(span);
          spans.push(span);
        } else {
          run += ch;
        }
      }
      flush();
      textNode.parentNode.replaceChild(frag, textNode);
    }
    this.logoSpans = spans;
    return spans;
  }

  /**
   * Work out which buffer cell each logo digit sits on, by geometry: rows
   * relative to the first stream row, columns relative to the left side's
   * logo edge. Digits outside the stream rows are left alone.
   */
  locateLogoBits(leftEl, charW) {
    const spans = this.wrapLogoDigits();
    const probe = this.sides[0].spans[0].getBoundingClientRect();
    const rowTop = probe.top;
    const lineH = probe.height || charW * 2;
    const originX = leftEl.getBoundingClientRect().right;

    this.logoBits = [];
    const keep = [];
    for (const span of spans) {
      const r = span.getBoundingClientRect();
      const row = Math.round((r.top - rowTop) / lineH);
      const col = Math.round((r.left - originX) / charW);
      const onStream =
        row >= 0 && row < this.streamRows && col >= 0 && col < this.gapCols;
      if (!onStream) {
        // Not a stream cell (e.g. indentation on other rows): restore plain text.
        span.replaceWith(document.createTextNode(span.textContent));
        continue;
      }
      keep.push(span);
      this.logoBits.push({ span, row, col });
    }
    this.logoSpans = keep;

    // First time only: put the logo's own digits into the buffer so the
    // stream starts from the static art instead of jumping to noise.
    if (!this.logoSeeded) {
      this.logoSeeded = true;
      const chars = this.rows.map((row) => row.split(""));
      for (const { span, row, col } of this.logoBits) {
        const ch = span.textContent;
        if (ch === "0" || ch === "1") chars[row][this.leftCols + col] = ch;
      }
      this.rows = chars.map((c) => c.join(""));
    }
  }

  /** Keep existing bits, extend with random ones on the right, or trim. */
  resizeBuffers(total) {
    for (let i = 0; i < this.streamRows; i++) {
      let row = this.rows[i] || "";
      if (row.length > total) {
        row = row.slice(0, total);
      } else {
        while (row.length < total) row += this.randomBit();
      }
      this.rows[i] = row;
    }
  }

  /**
   * Replace a section's children with a single <pre> that mirrors the
   * layout of the old 52-character tiles, sized to the section's width.
   */
  buildSide(el, className, cols) {
    const pre = document.createElement("pre");
    pre.className = className;

    const staticRow = (ch) => {
      const span = document.createElement("span");
      span.className = this.staticClass;
      span.textContent = ch.repeat(cols);
      return span;
    };

    pre.appendChild(document.createTextNode("\n".repeat(this.blankLines)));
    pre.appendChild(staticRow("y"));
    pre.appendChild(document.createTextNode("\n"));
    pre.appendChild(staticRow("$"));
    pre.appendChild(document.createTextNode("\n"));

    const spans = [];
    for (let i = 0; i < this.streamRows; i++) {
      const span = document.createElement("span");
      span.className = `${this.streamClass} stream-row`;
      pre.appendChild(span);
      pre.appendChild(document.createTextNode("\n"));
      spans.push(span);
    }

    pre.appendChild(staticRow("$"));
    pre.appendChild(document.createTextNode("\n"));

    el.replaceChildren(pre);
    return { el, pre, spans };
  }

  randomBit() {
    return Math.random() < this.oneProbability ? "1" : "0";
  }

  /** Row text as HTML with every run of 1s wrapped in the bright class. */
  rowHtml(text) {
    return text.replace(/1+/g, (run) => `<span class="${this.oneClass}">${run}</span>`);
  }

  /** Write the visible windows of each row into both sides. */
  render() {
    const [left, right] = this.sides;
    if (!left || !right) return;
    const rightStart = this.leftCols + this.gapCols;
    for (let i = 0; i < this.streamRows; i++) {
      const row = this.rows[i];
      left.spans[i].innerHTML = this.rowHtml(row.slice(0, this.leftCols));
      right.spans[i].innerHTML = this.rowHtml(row.slice(rightStart));
    }
    for (const { span, row, col } of this.logoBits) {
      const ch = this.rows[row][this.leftCols + col];
      if (span.textContent !== ch) {
        span.textContent = ch;
        span.className = `stream-bit ${
          ch === "1" ? this.logoOneClass : this.logoZeroClass
        }`;
      }
    }
  }

  /** Shift every row one character left and feed a new bit on the right. */
  step() {
    for (let i = 0; i < this.streamRows; i++) {
      this.rows[i] = this.rows[i].slice(1) + this.randomBit();
    }
  }

  start() {
    if (this.rafId) return;
    this.lastTime = 0;
    this.accumulated = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  tick(now) {
    if (this.lastTime) this.accumulated += now - this.lastTime;
    this.lastTime = now;

    // After a long pause (hidden tab) do not replay hundreds of steps.
    let steps = Math.min(50, Math.floor(this.accumulated / this.stepMs));
    if (steps > 0) {
      this.accumulated -= steps * this.stepMs;
      while (steps-- > 0) this.step();
      this.render();
    }
    this.rafId = requestAnimationFrame(this.tick);
  }

  onResize() {
    if (this.resizePending) return;
    this.resizePending = true;
    requestAnimationFrame(() => {
      this.resizePending = false;
      this.build();
      this.render();
    });
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    if (this.fontObserver) this.fontObserver.disconnect();
  }
}
