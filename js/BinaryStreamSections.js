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
   */
  constructor(config) {
    this.sections = config.sections;
    this.stepMs = config.stepMs ?? 150;
    this.streamRows = config.streamRows ?? 3;
    this.blankLines = config.blankLines ?? 4;
    this.staticClass = config.staticClass || "code-logo-color-3";
    this.streamClass = config.streamClass || "black-bg";

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
    return Math.random() < 0.5 ? "0" : "1";
  }

  /** Write the visible windows of each row into both sides. */
  render() {
    const [left, right] = this.sides;
    if (!left || !right) return;
    const rightStart = this.leftCols + this.gapCols;
    for (let i = 0; i < this.streamRows; i++) {
      const row = this.rows[i];
      left.spans[i].textContent = row.slice(0, this.leftCols);
      right.spans[i].textContent = row.slice(rightStart);
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
