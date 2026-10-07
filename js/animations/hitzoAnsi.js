/**
 * Hitomezashi stitch pattern drawn with box-drawing characters.
 *
 * Same lattice as js/animations/hitzo.js (one random bit per row and per
 * column, stitches alternating on/off from that bit), but every lattice node
 * is one character cell instead of a point on a line. In a Hitomezashi lattice
 * each node has exactly one horizontal half-stitch (left xor right) and exactly
 * one vertical half-stitch (up xor down), so every node cell is one of the four
 * corners ┌ ┐ └ ┘; the cells between two node columns carry ─ or nothing.
 *
 * A vertical stitch is one character row tall. A horizontal stitch is
 * round(cellH / cellW) columns wide, so with the page's 8×16 fonts it is two
 * cells wide and the stitches are square, the same lattice spacing as the line
 * version. The lattice is treated as infinite: cells on the canvas edge get a
 * full corner where the line version leaves its edge stitch dangling.
 *
 * The pattern is static, so it is drawn once into an off-screen buffer and
 * blitted each frame.
 */

// single-line CP437 set; swap for ═ ╔ ╗ ╚ ╝ for the double-line look
const GLYPHS = { h: "─", rd: "┌", ld: "┐", ru: "└", lu: "┘" };

export default {
  name: "hitzo-ansi",
  // new random bits on every setup, so a re-run gives a new pattern
  random: true,

  setup(p, bg) {
    // columns per horizontal stitch: enough to make the stitch cellH px wide
    this.stitchCols = Math.max(1, Math.round(bg.cellH / bg.cellW));
    this.rowBits = [];
    this.colBits = [];
    const units = Math.ceil(bg.cols / this.stitchCols) + 1;
    for (let r = 0; r < bg.rows; r++) this.rowBits.push(Math.random() < 0.5 ? 1 : 0);
    for (let j = 0; j < units; j++) this.colBits.push(Math.random() < 0.5 ? 1 : 0);
    this.buildBuffer(p, bg);
  },

  /** The character at character cell (r, c), or " " where the lattice is blank there. */
  glyph(r, c) {
    const w = this.stitchCols;
    const j = Math.floor(c / w); // stitch unit along the row
    // stitch [j, j+1] is drawn on row r iff j and the row's bit have equal parity
    const right = ((j + this.rowBits[r]) & 1) === 0;
    if (c % w !== 0) return right ? GLYPHS.h : " ";
    // stitch [r, r+1] is drawn on column j iff r and the column's bit have equal parity
    const down = ((r + this.colBits[j]) & 1) === 0;
    if (right) return down ? GLYPHS.rd : GLYPHS.ru;
    return down ? GLYPHS.ld : GLYPHS.lu;
  },

  /** Draw every cell that is not behind an excluded element. */
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
    for (let r = 0; r < bg.rows; r++) {
      const y = r * bg.cellH;
      for (let c = 0; c < bg.cols; c++) {
        const ch = this.glyph(r, c);
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

  draw(p) {
    p.clear();
    p.image(this.buffer, 0, 0);
  },

  destroy() {
    if (this.buffer) this.buffer.remove();
    this.buffer = null;
  },
};
