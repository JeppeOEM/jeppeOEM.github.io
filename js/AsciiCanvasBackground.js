/**
 * Full-viewport ASCII background drawn on a single <canvas>.
 *
 * Replaces the <pre>-grid approach from AsciiBackground.js so that individual
 * characters can be mutated cheaply. Moving the pointer over the page
 * scrambles the characters around the cursor; they fall back to the original
 * pattern after `restoreAfter` milliseconds.
 *
 * Elements listed in `exclude` punch a hole in the grid: no characters are
 * drawn (or scrambled) behind them, so they read as an empty box.
 */
export default class AsciiCanvasBackground {
  /**
   * @param {Object} config
   * @param {string} config.asciiArt            Pattern that is tiled across the screen
   * @param {HTMLElement} [config.container]    Element that receives the canvas (default: body)
   * @param {Object} [config.style]
   * @param {string} [config.style.color]       Base character color
   * @param {string} [config.style.highlight]   Color of freshly scrambled characters
   * @param {number} [config.style.opacity]
   * @param {number} [config.style.zIndex]
   * @param {string} [config.charset]           Characters used when scrambling
   * @param {number} [config.radius]            Scramble radius in pixels around the pointer
   * @param {number} [config.restoreAfter]      ms before a scrambled cell reverts (0 = never)
   * @param {(string|HTMLElement)[]} [config.exclude]  Selectors/elements with no characters behind them
   * @param {number} [config.excludePadding]    Extra hole margin in cells
   */
  constructor(config) {
    this.container = config.container || document.body;
    this.asciiArt = config.asciiArt;
    this.style = {
      color: config.style?.color || "#333",
      highlight: config.style?.highlight || config.style?.color || "#333",
      opacity: config.style?.opacity ?? 1,
      zIndex: config.style?.zIndex ?? -1,
    };
    this.charset = config.charset || "0123456789abcdef";
    this.radius = config.radius ?? 40;
    this.restoreAfter = config.restoreAfter ?? 1200;
    this.exclude = config.exclude || [];
    this.excludePadding = config.excludePadding ?? 1;

    this.patternLines = this.asciiArt
      .split("\n")
      .filter((line) => line.trim() !== "");
    this.patternWidth = Math.max(...this.patternLines.map((l) => l.length));

    this.cols = 0;
    this.rows = 0;
    this.cellW = 8;
    this.cellH = 16;
    this.font = "";
    /** @type {string[]} current character per cell (row-major) */
    this.chars = [];
    /** @type {Map<number, number>} cell index -> timestamp of last scramble */
    this.active = new Map();
    /** @type {DOMRect[]} pixel rectangles (viewport coords) with no characters */
    this.holes = [];
    this.rafId = 0;
    this.ready = false;

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.tick = this.tick.bind(this);

    this.createCanvas();
    this.setup();
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "ascii-canvas-background";
    Object.assign(this.canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: String(this.style.zIndex),
      pointerEvents: "none",
      userSelect: "none",
    });
    this.ctx = this.canvas.getContext("2d", { alpha: true });
    this.container.appendChild(this.canvas);
  }

  /** Wait for the page font, then measure, build and draw. */
  async setup() {
    this.font = this.resolveFont();
    this.colors = {
      base: this.resolveColor(this.style.color),
      highlight: this.resolveColor(this.style.highlight),
    };
    try {
      await document.fonts.load(this.font, "0");
      await document.fonts.ready;
    } catch (e) {
      /* fall through with whatever font is available */
    }
    this.build();
    this.draw();
    this.ready = true;
    requestAnimationFrame(() => this.canvas.classList.add("show"));

    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });

    // The font selector changes body's inline font-family; follow it.
    this.fontObserver = new MutationObserver(() => this.refont());
    this.fontObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  /**
   * Canvas fillStyle cannot read CSS variables, so resolve e.g. "var(--x)"
   * to the computed color through a temporary element.
   */
  resolveColor(value) {
    if (!/var\(/.test(value)) return value;
    const probe = document.createElement("span");
    probe.style.color = value;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved || "#333";
  }

  /** Canvas font string derived from the body's computed style. */
  resolveFont() {
    const cs = getComputedStyle(document.body);
    const size = parseFloat(cs.fontSize) || 16;
    return `${size}px ${cs.fontFamily || "monospace"}`;
  }

  async refont() {
    const next = this.resolveFont();
    if (next === this.font) return;
    this.font = next;
    try {
      await document.fonts.load(this.font, "0");
    } catch (e) {}
    this.build();
    this.draw();
  }

  /** Measure cells, size the canvas and fill the character grid. */
  build() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.font = this.font;
    this.ctx.textBaseline = "top";
    this.ctx.imageSmoothingEnabled = false;

    const cs = getComputedStyle(document.body);
    const fontSize = parseFloat(cs.fontSize) || 16;
    const lineHeight = parseFloat(cs.lineHeight);
    this.cellW = this.ctx.measureText("0").width || fontSize * 0.5;
    this.cellH = Number.isFinite(lineHeight) ? lineHeight : fontSize;

    this.cols = Math.ceil(w / this.cellW) + 1;
    this.rows = Math.ceil(h / this.cellH) + 1;

    this.chars = new Array(this.cols * this.rows);
    for (let r = 0; r < this.rows; r++) {
      const line = this.patternLines[r % this.patternLines.length];
      for (let c = 0; c < this.cols; c++) {
        this.chars[r * this.cols + c] = line[c % this.patternWidth] ?? " ";
      }
    }
    this.active.clear();
    this.updateHoles();
  }

  /** Character the pattern puts at a cell (used to restore scrambled cells). */
  baseChar(r, c) {
    const line = this.patternLines[r % this.patternLines.length];
    return line[c % this.patternWidth] ?? " ";
  }

  /** Recompute the pixel rectangles behind excluded elements. */
  updateHoles() {
    const padX = this.excludePadding * this.cellW;
    const padY = this.excludePadding * this.cellH;
    this.holes = [];
    for (const item of this.exclude) {
      const els =
        typeof item === "string" ? document.querySelectorAll(item) : [item];
      for (const el of els) {
        if (!el) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        this.holes.push({
          left: b.left - padX,
          top: b.top - padY,
          right: b.right + padX,
          bottom: b.bottom + padY,
        });
      }
    }
  }

  inHole(r, c) {
    if (this.holes.length === 0) return false;
    const x0 = c * this.cellW;
    const y0 = r * this.cellH;
    const x1 = x0 + this.cellW;
    const y1 = y0 + this.cellH;
    for (const h of this.holes) {
      if (x1 > h.left && x0 < h.right && y1 > h.top && y0 < h.bottom) {
        return true;
      }
    }
    return false;
  }

  /** Redraw every cell. */
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = this.font;
    ctx.textBaseline = "top";
    ctx.globalAlpha = this.style.opacity;
    ctx.fillStyle = this.colors.base;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.inHole(r, c)) continue;
        const i = r * this.cols + c;
        const ch = this.chars[i];
        if (ch === " ") continue;
        if (this.active.has(i)) {
          ctx.fillStyle = this.colors.highlight;
          ctx.fillText(ch, c * this.cellW, r * this.cellH);
          ctx.fillStyle = this.colors.base;
        } else {
          ctx.fillText(ch, c * this.cellW, r * this.cellH);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawCell(r, c, color) {
    const ctx = this.ctx;
    const x = c * this.cellW;
    const y = r * this.cellH;
    ctx.clearRect(x, y, this.cellW, this.cellH);
    if (this.inHole(r, c)) return;
    const ch = this.chars[r * this.cols + c];
    if (ch === " ") return;
    ctx.globalAlpha = this.style.opacity;
    ctx.fillStyle = color;
    ctx.fillText(ch, x, y);
    ctx.globalAlpha = 1;
  }

  randomChar() {
    return this.charset[(Math.random() * this.charset.length) | 0];
  }

  onPointerMove(e) {
    if (!this.ready) return;
    const x = e.clientX;
    const y = e.clientY;
    const rc = Math.ceil(this.radius / this.cellW);
    const rr = Math.ceil(this.radius / this.cellH);
    const col = Math.floor(x / this.cellW);
    const row = Math.floor(y / this.cellH);
    const now = performance.now();
    const r2 = this.radius * this.radius;

    for (let r = row - rr; r <= row + rr; r++) {
      if (r < 0 || r >= this.rows) continue;
      for (let c = col - rc; c <= col + rc; c++) {
        if (c < 0 || c >= this.cols) continue;
        // distance from pointer to the cell centre
        const dx = (c + 0.5) * this.cellW - x;
        const dy = (r + 0.5) * this.cellH - y;
        if (dx * dx + dy * dy > r2) continue;
        if (this.inHole(r, c)) continue;
        const i = r * this.cols + c;
        this.chars[i] = this.randomChar();
        this.active.set(i, now);
        this.drawCell(r, c, this.colors.highlight);
      }
    }
    if (this.restoreAfter > 0 && !this.rafId) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  /** Restore scrambled cells whose time is up. Runs only while cells are active. */
  tick() {
    this.rafId = 0;
    const now = performance.now();
    for (const [i, t] of this.active) {
      if (now - t < this.restoreAfter) continue;
      this.active.delete(i);
      const r = Math.floor(i / this.cols);
      const c = i - r * this.cols;
      this.chars[i] = this.baseChar(r, c);
      this.drawCell(r, c, this.colors.base);
    }
    if (this.active.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  onResize() {
    this.build();
    this.draw();
  }

  onScroll() {
    // The canvas is fixed but excluded elements scroll, so the holes move.
    if (this.exclude.length === 0) return;
    this.updateHoles();
    this.draw();
  }

  setAsciiArt(newArt) {
    this.asciiArt = newArt;
    this.patternLines = newArt.split("\n").filter((l) => l.trim() !== "");
    this.patternWidth = Math.max(...this.patternLines.map((l) => l.length));
    this.build();
    this.draw();
  }

  destroy() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    if (this.fontObserver) this.fontObserver.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.canvas.remove();
  }
}
