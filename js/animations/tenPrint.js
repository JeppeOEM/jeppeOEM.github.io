/**
 * 10 PRINT CHR$(205.5+RND(1)); : GOTO 10
 *
 * Every character cell holds a random `\` or `/`. The grid is first written
 * cell by cell like the C64 one-liner filling the screen, then keeps mutating:
 * each frame a handful of random cells flip, briefly lit in the highlight
 * colour before settling back. The pointer flips the cells it passes over.
 *
 * Cells are drawn into an off-screen buffer only when they change; each frame
 * blits the buffer, so the cost per frame is the flips, not the whole grid.
 */
const fillPerFrame = 60; // cells written per frame during the initial sweep
const flipsPerFrame = 3; // random flips per frame once the screen is full
const settleAfter = 700; // ms a flipped cell stays in the highlight colour
const pointerRadius = 40; // px

export default {
  name: "tenPrint",

  setup(p, bg) {
    this.cols = bg.cols;
    this.rows = bg.rows;
    this.cells = new Uint8Array(this.cols * this.rows);
    for (let i = 0; i < this.cells.length; i++) this.cells[i] = Math.random() < 0.5 ? 1 : 0;
    this.cursor = 0; // next cell of the initial sweep
    /** @type {Map<number, number>} cell index -> time it flipped */
    this.lit = new Map();
    if (this.buffer) this.buffer.remove();
    this.buffer = p.createGraphics(p.width, p.height);
    const g = this.buffer;
    g.pixelDensity(p.pixelDensity());
    g.textFont(bg.font);
    g.textSize(bg.fontSize);
    g.textAlign(p.LEFT, p.TOP);
    g.noStroke();
  },

  /** Redraw one cell into the buffer in the given colour (blank if behind the text box). */
  paint(p, bg, i, color) {
    const r = Math.floor(i / this.cols);
    const c = i - r * this.cols;
    const x = c * bg.cellW;
    const y = r * bg.cellH;
    const g = this.buffer;
    g.erase();
    g.rect(x, y, bg.cellW, bg.cellH);
    g.noErase();
    if (bg.rectInHole(x, y, x + bg.cellW, y + bg.cellH)) return;
    g.fill(color);
    g.text(this.cells[i] ? "/" : "\\", x, y);
  },

  flip(p, bg, i, now) {
    this.cells[i] ^= 1;
    this.lit.set(i, now);
    this.paint(p, bg, i, bg.colors.highlight);
  },

  holesChanged(p, bg) {
    // the text box moved: repaint everything already written, in its settled colour
    const written = Math.min(this.cursor, this.cells.length);
    for (let i = 0; i < written; i++) {
      this.paint(p, bg, i, this.lit.has(i) ? bg.colors.highlight : bg.colors.base);
    }
  },

  draw(p, bg) {
    const now = performance.now();
    const total = this.cells.length;

    if (this.cursor < total) {
      // the initial sweep, in reading order like the original program
      const end = Math.min(total, this.cursor + fillPerFrame);
      for (let i = this.cursor; i < end; i++) this.paint(p, bg, i, bg.colors.base);
      this.cursor = end;
    } else {
      for (let n = 0; n < flipsPerFrame; n++) this.flip(p, bg, (Math.random() * total) | 0, now);
    }

    for (const [i, t] of this.lit) {
      if (now - t < settleAfter) continue;
      this.lit.delete(i);
      this.paint(p, bg, i, bg.colors.base);
    }

    p.clear();
    p.image(this.buffer, 0, 0);
  },

  pointer(p, bg, x, y) {
    if (this.cursor < this.cells.length) return;
    const now = performance.now();
    const rc = Math.ceil(pointerRadius / bg.cellW);
    const rr = Math.ceil(pointerRadius / bg.cellH);
    const col = Math.floor(x / bg.cellW);
    const row = Math.floor(y / bg.cellH);
    const r2 = pointerRadius * pointerRadius;
    for (let r = row - rr; r <= row + rr; r++) {
      if (r < 0 || r >= this.rows) continue;
      for (let c = col - rc; c <= col + rc; c++) {
        if (c < 0 || c >= this.cols) continue;
        const dx = (c + 0.5) * bg.cellW - x;
        const dy = (r + 0.5) * bg.cellH - y;
        if (dx * dx + dy * dy > r2) continue;
        const i = r * this.cols + c;
        // flip only once per pass: a lit cell was flipped a moment ago
        if (!this.lit.has(i)) this.flip(p, bg, i, now);
      }
    }
  },

  destroy() {
    if (this.buffer) this.buffer.remove();
    this.buffer = null;
  },
};
