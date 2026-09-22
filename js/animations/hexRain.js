/**
 * Columns of hex digits falling down the page, one drop per character column.
 *
 * The canvas is opaque black here: each frame is darkened a little instead of
 * cleared, which leaves the trail behind every head. Excluded elements are
 * painted black again afterwards so the text box stays empty.
 */
const charset = "0123456789abcdef";

export default {
  name: "hexRain",

  setup(p, bg) {
    this.drops = [];
    for (let c = 0; c < bg.cols; c++) this.drops.push(this.newDrop(p, bg, true));
    p.background(0);
  },

  newDrop(p, bg, anywhere) {
    return {
      // row of the head; start above the screen unless seeding the first frame
      row: anywhere ? Math.floor(Math.random() * bg.rows) : -Math.floor(Math.random() * 20),
      speed: 0.3 + Math.random() * 0.9, // rows per frame
      trail: 6 + Math.floor(Math.random() * 18),
      // most columns idle so the rain is sparse; an idle drop waits then restarts
      wait: Math.random() < 0.6 ? Math.floor(Math.random() * 200) : 0,
    };
  },

  draw(p, bg) {
    // fade the previous frame: the longer a char has been drawn the darker it is
    p.noStroke();
    p.fill(0, 0, 0, 28);
    p.rect(0, 0, p.width, p.height);

    for (let c = 0; c < this.drops.length; c++) {
      const d = this.drops[c];
      if (d.wait > 0) {
        d.wait--;
        continue;
      }
      const prevRow = Math.floor(d.row);
      d.row += d.speed;
      const row = Math.floor(d.row);
      if (row === prevRow) continue;

      const x = c * bg.cellW;
      const y = row * bg.cellH;
      // the cell the head just left turns into trail colour
      if (prevRow >= 0) {
        p.fill(bg.colors.base);
        this.cell(p, bg, x, prevRow * bg.cellH);
      }
      if (row >= 0 && row < bg.rows) {
        p.fill(bg.colors.highlight);
        this.cell(p, bg, x, y);
      }
      if (row - d.trail > bg.rows) this.drops[c] = this.newDrop(p, bg, false);
    }

    // keep the text box clear
    p.fill(0);
    for (const h of bg.holes) p.rect(h.left, h.top, h.right - h.left, h.bottom - h.top);
  },

  /** Draw one random hex digit at a cell unless the cell is behind the text box. */
  cell(p, bg, x, y) {
    if (bg.rectInHole(x, y, x + bg.cellW, y + bg.cellH)) return;
    p.text(charset[(Math.random() * charset.length) | 0], x, y);
  },
};
