/**
 * Hitomezashi stitch pattern (ported from src/p5code/hitzo/sketch.js).
 *
 * Every grid row and column gets a random bit; a row's stitches start on or
 * off the first cell depending on its bit, alternating stitch/skip across the
 * screen, and the same for columns downwards. Together they form the familiar
 * maze of interlocking shapes. The pattern is static, so it is drawn once into
 * an off-screen buffer and blitted each frame.
 */

export default {
  name: "hitzo",
  // new random bits on every setup, so a re-run gives a new pattern
  random: true,

  setup(p, bg) {
    // one stitch is one character cell tall, so it lines up with the text rows
    this.stitch = bg.cellH;
    this.rowBits = [];
    this.colBits = [];
    const rows = Math.ceil(p.height / this.stitch) + 1;
    const cols = Math.ceil(p.width / this.stitch) + 1;
    for (let i = 0; i < rows; i++) this.rowBits.push(Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < cols; i++) this.colBits.push(Math.random() < 0.5 ? 1 : 0);
    this.buildBuffer(p, bg);
  },

  /** Draw every stitch that is not behind an excluded element. */
  buildBuffer(p, bg) {
    if (this.buffer) this.buffer.remove();
    this.buffer = p.createGraphics(p.width, p.height);
    const g = this.buffer;
    g.pixelDensity(p.pixelDensity());
    g.stroke(bg.colors.base);
    g.strokeWeight(2);
    const s = this.stitch;

    // horizontal stitches: along each row, every other cell, offset by the row's bit
    for (let k = 0; k < this.rowBits.length; k++) {
      const y = k * s;
      for (let x = this.rowBits[k] * s; x < p.width; x += 2 * s) {
        if (bg.rectInHole(x, y - 1, x + s, y + 1)) continue;
        g.line(x, y, x + s, y);
      }
    }

    // vertical stitches: down each column, offset by the column's bit
    for (let m = 0; m < this.colBits.length; m++) {
      const x = m * s;
      for (let y = this.colBits[m] * s; y < p.height; y += 2 * s) {
        if (bg.rectInHole(x - 1, y, x + 1, y + s)) continue;
        g.line(x, y, x, y + s);
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
