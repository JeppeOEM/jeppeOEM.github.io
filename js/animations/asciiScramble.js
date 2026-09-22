/**
 * The tiled ASCII pattern with pointer scramble, as a p5 animation.
 *
 * Port of js/AsciiCanvasBackground.js: the pattern is drawn once into an
 * off-screen buffer; each frame blits that buffer and draws only the cells
 * the pointer has scrambled, which fall back to the pattern after
 * `restoreAfter` ms. The scramble radius grows with pointer speed.
 */
import { patterns } from "../asciiPatterns.js";

const charset = "0123456789abcdef";
const radius = 48; // px, at full pointer speed
const minRadius = radius / 3;
const maxSpeed = 0.8; // px/ms that reaches `radius`
const flicker = 0.25; // per-frame chance an active cell changes character
const restoreAfter = 1500; // ms

const lines = patterns.pattern1.split("\n").filter((l) => l.trim() !== "");
// +1 so a blank column separates a tile from its own repeat.
const patternWidth = Math.max(...lines.map((l) => l.length)) + 1;

const baseChar = (r, c) => lines[r % lines.length][c % patternWidth] ?? " ";

export default {
  name: "asciiScramble",

  setup(p, bg) {
    this.cols = bg.cols;
    this.rows = bg.rows;
    /** @type {Map<number, {t: number, ch: string}>} cell index -> scramble time + char */
    this.active = new Map();
    this.curRadius = minRadius;
    this.buildBuffer(p, bg);
  },

  /** Draw the whole pattern (minus holes) into an off-screen buffer once. */
  buildBuffer(p, bg) {
    if (this.buffer) this.buffer.remove();
    this.buffer = p.createGraphics(p.width, p.height);
    const g = this.buffer;
    g.pixelDensity(p.pixelDensity());
    g.textFont(bg.font);
    g.textSize(bg.fontSize);
    g.textAlign(p.LEFT, p.TOP);
    g.noStroke();
    g.fill(bg.colors.base);
    for (let r = 0; r < this.rows; r++) {
      const y = r * bg.cellH;
      for (let c = 0; c < this.cols; c++) {
        const ch = baseChar(r, c);
        if (ch === " ") continue;
        const x = c * bg.cellW;
        if (bg.rectInHole(x, y, x + bg.cellW, y + bg.cellH)) continue;
        g.text(ch, x, y);
      }
    }
  },

  holesChanged(p, bg) {
    this.buildBuffer(p, bg);
  },

  draw(p, bg) {
    p.clear();
    p.image(this.buffer, 0, 0);
    if (this.active.size === 0) return;

    const now = performance.now();
    p.fill(bg.colors.highlight);
    for (const [i, cell] of this.active) {
      const r = Math.floor(i / this.cols);
      const c = i - r * this.cols;
      const age = now - cell.t;
      if (age >= restoreAfter) {
        this.active.delete(i);
        continue;
      }
      // flicker slows from full rate to a tenth of it over the cell's life
      const rate = flicker * (1 - (9 / 10) * (age / restoreAfter));
      if (Math.random() < rate) cell.ch = charset[(Math.random() * charset.length) | 0];
      const x = c * bg.cellW;
      const y = r * bg.cellH;
      // the buffer still shows the base character here: cover it first
      p.erase();
      p.rect(x, y, bg.cellW, bg.cellH);
      p.noErase();
      p.fill(bg.colors.highlight);
      p.text(cell.ch, x, y);
    }
  },

  pointer(p, bg, x, y, speed) {
    // Radius follows pointer speed: small while slow, easing toward `radius`.
    const k = Math.min(speed / maxSpeed, 1);
    const target = minRadius + (radius - minRadius) * k;
    this.curRadius += (target - this.curRadius) * 0.25;

    const rad = this.curRadius;
    const rc = Math.ceil(rad / bg.cellW);
    const rr = Math.ceil(rad / bg.cellH);
    const col = Math.floor(x / bg.cellW);
    const row = Math.floor(y / bg.cellH);
    const r2 = rad * rad;
    const now = performance.now();

    for (let r = row - rr; r <= row + rr; r++) {
      if (r < 0 || r >= this.rows) continue;
      for (let c = col - rc; c <= col + rc; c++) {
        if (c < 0 || c >= this.cols) continue;
        const dx = (c + 0.5) * bg.cellW - x;
        const dy = (r + 0.5) * bg.cellH - y;
        if (dx * dx + dy * dy > r2) continue;
        if (baseChar(r, c) === " ") continue;
        const x0 = c * bg.cellW;
        const y0 = r * bg.cellH;
        if (bg.rectInHole(x0, y0, x0 + bg.cellW, y0 + bg.cellH)) continue;
        this.active.set(r * this.cols + c, {
          t: now,
          ch: charset[(Math.random() * charset.length) | 0],
        });
      }
    }
  },

  destroy() {
    if (this.buffer) this.buffer.remove();
    this.buffer = null;
  },
};
