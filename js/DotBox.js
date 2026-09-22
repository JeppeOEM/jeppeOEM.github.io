/**
 * Dotted outline that grows out of a logo.
 *
 * The last row of the logo <pre> contains two `:` characters. Two `:` columns
 * drop straight down from them, land on the top edge of a box drawn with `.`
 * (horizontal) and `:` (vertical), and the box wraps the content element.
 *
 * The outline is a <pre> of one <span> per cell, absolutely positioned so that
 * its character grid is snapped to the logo's grid. Each span gets a step index
 * (`--i`) equal to its path distance from the logo, so a CSS animation-delay
 * makes the outline appear cell by cell: down the feeders, along the top edge
 * from the two landing points, down the sides and along the bottom edge until
 * it closes in the middle.
 */
export default class DotBox {
  /**
   * @param {Object} config
   * @param {HTMLElement} config.logo        The logo <pre>
   * @param {HTMLElement} config.box         Wrapper the outline is positioned in
   * @param {HTMLElement} config.outline     <pre> that receives the cells
   * @param {HTMLElement} [config.content]   Element faded in once the outline closes
   * @param {number[]} [config.feederCols]   Logo columns of the two `:` (default: found in the last logo row)
   * @param {number} [config.stepMs]         Delay between two cells appearing
   * @param {number} [config.startDelay]     ms before the first cell appears
   * @param {string} [config.vChar]          Character for vertical runs
   * @param {string} [config.hChar]          Character for horizontal runs
   */
  constructor(config) {
    this.logo = config.logo;
    this.box = config.box;
    this.outline = config.outline;
    this.content = config.content || null;
    this.feederCols = config.feederCols || null;
    this.stepMs = config.stepMs ?? 30;
    this.startDelay = config.startDelay ?? 600;
    this.vChar = config.vChar || ":";
    this.hChar = config.hChar || ".";

    this.cellW = 8;
    this.cellH = 16;
    this.started = false;
    this.rafId = 0;

    this.onResize = this.onResize.bind(this);
  }

  async init() {
    try {
      await document.fonts.ready;
    } catch (e) {
      /* draw with whatever font is available */
    }
    this.outline.style.setProperty("--dot-step", `${this.stepMs}ms`);
    this.render();
    window.addEventListener("resize", this.onResize);

    setTimeout(() => {
      this.started = true;
      this.outline.classList.add("grow");
      if (this.content) {
        const total = Number(this.outline.dataset.steps || 0);
        setTimeout(() => this.content.classList.add("show"), total * this.stepMs + 200);
      }
    }, this.startDelay);
  }

  /** Width/height of one character cell, measured in the logo's own font. */
  measureCell() {
    const probe = document.createElement("span");
    probe.textContent = ":";
    this.logo.appendChild(probe);
    const r = probe.getBoundingClientRect();
    probe.remove();
    if (r.width > 0) this.cellW = r.width;
    if (r.height > 0) this.cellH = r.height;
  }

  /** Columns of the `:` characters in the last non-empty logo row. */
  findFeederCols() {
    if (this.feederCols) return this.feederCols;
    const lines = this.logo.textContent.split("\n").filter((l) => l.trim() !== "");
    const last = lines[lines.length - 1] || "";
    const cols = [];
    for (let i = 0; i < last.length; i++) if (last[i] === this.vChar) cols.push(i);
    return cols;
  }

  /** Build the character grid and step index per cell, then write the spans. */
  render() {
    this.measureCell();
    const feeders = this.findFeederCols();
    const cw = this.cellW;
    const ch = this.cellH;
    const logoRect = this.logo.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect();

    // Snap the outline grid to the logo grid: column c of the outline sits
    // under logo column c + shift.
    const shift = Math.round((boxRect.left - logoRect.left) / cw);
    const left = logoRect.left + shift * cw - boxRect.left;
    const top = logoRect.bottom - boxRect.top;

    const cols = Math.floor((boxRect.width - left) / cw);
    const feederRows = Math.max(1, Math.round((boxRect.top - logoRect.bottom) / ch));
    const rows = feederRows + Math.round(boxRect.height / ch);

    const topRow = feederRows;
    const bottomRow = rows - 1;
    const lastCol = cols - 1;
    const landings = feeders
      .map((c) => c - shift)
      .filter((c) => c > 0 && c < lastCol);

    const chars = new Array(rows * cols).fill(" ");
    const steps = new Array(rows * cols).fill(-1);
    const put = (r, c, chr, step) => {
      const i = r * cols + c;
      chars[i] = chr;
      steps[i] = steps[i] < 0 ? step : Math.min(steps[i], step);
    };

    // feeders: straight down from the logo onto the top edge
    for (const c of landings) {
      for (let r = 0; r < feederRows; r++) put(r, c, this.vChar, r);
    }
    // top edge, growing away from each landing point
    const distTop = (c) =>
      landings.length ? Math.min(...landings.map((l) => Math.abs(c - l))) : c;
    for (let c = 0; c <= lastCol; c++) {
      put(topRow, c, this.hChar, feederRows + distTop(c));
    }
    // sides, growing down from the corners
    const leftStart = feederRows + distTop(0);
    const rightStart = feederRows + distTop(lastCol);
    for (let r = topRow + 1; r < bottomRow; r++) {
      put(r, 0, this.vChar, leftStart + (r - topRow));
      put(r, lastCol, this.vChar, rightStart + (r - topRow));
    }
    // bottom edge, closing in from both corners
    const leftBottom = leftStart + (bottomRow - topRow);
    const rightBottom = rightStart + (bottomRow - topRow);
    for (let c = 0; c <= lastCol; c++) {
      put(bottomRow, c, this.hChar, Math.min(leftBottom + c, rightBottom + (lastCol - c)));
    }
    // corners and landing cells read as joints
    put(topRow, 0, this.vChar, leftStart);
    put(topRow, lastCol, this.vChar, rightStart);
    put(bottomRow, 0, this.vChar, leftBottom);
    put(bottomRow, lastCol, this.vChar, rightBottom);
    for (const c of landings) put(topRow, c, this.vChar, feederRows);

    let total = 0;
    const html = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c <= lastCol; c++) {
        const i = r * cols + c;
        if (chars[i] === " ") {
          line += " ";
          continue;
        }
        total = Math.max(total, steps[i]);
        line += `<span style="--i:${steps[i]}">${chars[i]}</span>`;
      }
      html.push(line);
    }

    this.outline.innerHTML = html.join("\n");
    this.outline.dataset.steps = String(total);
    Object.assign(this.outline.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${cols * cw}px`,
    });
  }

  onResize() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.render();
      // a resize after the animation ran shows the outline at once
      if (this.started) this.outline.classList.add("done");
    });
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.outline.innerHTML = "";
  }
}
