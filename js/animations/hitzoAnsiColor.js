/**
 * Hitomezashi stitch pattern in box-drawing characters, with every enclosed
 * region filled in a shade picked by its size.
 *
 * Same lattice and glyph rule as js/animations/hitzoAnsi.js, but each lattice
 * cell is two character rows tall and `stitchCols` wide so it has an inside:
 * the top row and left column of a lattice cell carry its stitches (a corner
 * glyph on the node, ─ and │ along the lines), the rest is a solid block.
 * Where a stitch is missing, its character cells are solid too, so two cells
 * that no stitch separates read as one region. The blocks are drawn as one
 * rectangle per horizontal run of block cells rather than one █ glyph (or one
 * rectangle) per cell: the character cell width is fractional, so per-cell
 * drawing leaves hairline seams between columns.
 *
 * The stitches are walls between lattice cells; cells that no wall separates
 * form a region. Each region is flood-filled once (iteratively, so a
 * full-screen grid cannot overflow the stack) to find its size, and that size
 * picks the fill: single boxes in white, small shapes in grey, the long
 * winding corridors in dark grey. This follows the accepted answer to
 * https://stackoverflow.com/questions/71444608 (flood fill over a cell graph,
 * colour = f(component size)) with three shades instead of a greyscale ramp.
 *
 * The lattice spacing is two character rows, twice that of hitzo and
 * hitzo-ansi, because a one-row lattice cell has no interior character cell.
 *
 * The pattern is static, so it is drawn once into an off-screen buffer and
 * blitted each frame.
 */

// single-line CP437 set; swap for ═ ║ ╔ ╗ ╚ ╝ for the double-line look
const GLYPHS = { h: "─", v: "│", rd: "┌", ld: "┐", ru: "└", lu: "┘" };

// region size thresholds: up to `single` cells -> white, up to `small` -> grey, else dark grey
const single = 1;
const small = 8;

export default {
  name: "hitzo-ansi-color",
  // new random bits on every setup, so a re-run gives a new pattern
  random: true,

  setup(p, bg) {
    // a lattice cell is two character rows tall and enough columns to be square
    this.stitchRows = 2;
    this.stitchCols = Math.max(2, Math.round((this.stitchRows * bg.cellH) / bg.cellW));
    this.rows = Math.ceil(bg.rows / this.stitchRows) + 1;
    this.cols = Math.ceil(bg.cols / this.stitchCols) + 1;
    this.rowBits = [];
    this.colBits = [];
    for (let k = 0; k <= this.rows; k++) this.rowBits.push(Math.random() < 0.5 ? 1 : 0);
    for (let m = 0; m <= this.cols; m++) this.colBits.push(Math.random() < 0.5 ? 1 : 0);
    this.label();
    this.buildBuffer(p, bg);
  },

  /** Whether the stitch on horizontal line k above lattice column j is drawn. */
  wallAbove(k, j) {
    return ((j + this.rowBits[k]) & 1) === 0;
  },

  /** Whether the stitch on vertical line m left of lattice row r is drawn. */
  wallLeft(m, r) {
    return ((r + this.colBits[m]) & 1) === 0;
  },

  /** Flood-fill every region (iterative), recording each cell's region and the region sizes. */
  label() {
    const { rows, cols } = this;
    const n = rows * cols;
    this.region = new Int32Array(n).fill(-1);
    this.sizes = [];
    const stack = new Int32Array(n);
    for (let start = 0; start < n; start++) {
      if (this.region[start] !== -1) continue;
      const id = this.sizes.length;
      let size = 0;
      let top = 0;
      this.region[start] = id;
      stack[top++] = start;
      while (top > 0) {
        const i = stack[--top];
        size++;
        const r = Math.floor(i / cols);
        const c = i - r * cols;
        // step through each side of the cell that has no stitch on it
        if (r > 0 && !this.wallAbove(r, c)) top = this.push(i - cols, id, stack, top);
        if (r < rows - 1 && !this.wallAbove(r + 1, c)) top = this.push(i + cols, id, stack, top);
        if (c > 0 && !this.wallLeft(c, r)) top = this.push(i - 1, id, stack, top);
        if (c < cols - 1 && !this.wallLeft(c + 1, r)) top = this.push(i + 1, id, stack, top);
      }
      this.sizes.push(size);
    }
  },

  /** Label cell i and push it on the flood-fill stack unless it is labelled already; returns the new top. */
  push(i, id, stack, top) {
    if (this.region[i] !== -1) return top;
    this.region[i] = id;
    stack[top] = i;
    return top + 1;
  },

  /**
   * What character cell (r, c) shows: `{ ch, fill: -1 }` for a stitch glyph, or
   * `{ ch: null, fill }` for a solid block with `fill` the lattice cell to shade.
   */
  glyph(r, c) {
    const k = Math.floor(r / this.stitchRows); // lattice row (its top line is line k)
    const j = Math.floor(c / this.stitchCols); // lattice column (its left line is line j)
    const onLine = r % this.stitchRows === 0;
    const onCol = c % this.stitchCols === 0;
    const cell = k * this.cols + j;
    if (onLine && onCol) {
      const right = this.wallAbove(k, j);
      const down = this.wallLeft(j, k);
      if (right) return { ch: down ? GLYPHS.rd : GLYPHS.ru, fill: -1 };
      return { ch: down ? GLYPHS.ld : GLYPHS.lu, fill: -1 };
    }
    if (onLine && this.wallAbove(k, j)) return { ch: GLYPHS.h, fill: -1 };
    if (onCol && this.wallLeft(j, k)) return { ch: GLYPHS.v, fill: -1 };
    return { ch: null, fill: cell };
  },

  /** The fill colour of a region from its size. */
  shade(bg, size) {
    if (size <= single) return bg.colors.white;
    if (size <= small) return bg.colors.grey;
    return bg.colors.darkGrey;
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
    const shades = this.sizes.map((size) => this.shade(bg, size));
    for (let r = 0; r < bg.rows; r++) {
      const y = r * bg.cellH;
      // a run of block cells in one shade, drawn as one rectangle when it ends
      let runStart = -1;
      let runShade = null;
      for (let c = 0; c < bg.cols; c++) {
        const x = c * bg.cellW;
        const hidden = bg.rectInHole(x, y, x + bg.cellW, y + bg.cellH);
        const { ch, fill } = hidden ? { ch: null, fill: -1 } : this.glyph(r, c);
        const shade = fill < 0 ? null : shades[this.region[fill]];
        if (shade !== runShade && runStart >= 0) {
          this.fillRun(g, bg, runStart, c, y, runShade);
          runStart = -1;
        }
        if (shade !== null) {
          if (runStart < 0) runStart = c;
          runShade = shade;
        } else {
          runShade = null;
          if (ch !== null) {
            g.fill(bg.colors.stitch);
            g.text(ch, x, y);
          }
        }
      }
      if (runStart >= 0) this.fillRun(g, bg, runStart, bg.cols, y, runShade);
    }
  },

  /** One rectangle over character columns [from, to) of the row at y. */
  fillRun(g, bg, from, to, y, shade) {
    g.fill(shade);
    g.rect(from * bg.cellW, y, (to - from) * bg.cellW, bg.cellH);
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
