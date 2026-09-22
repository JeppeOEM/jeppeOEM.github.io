/**
 * Dotted outline that grows out of a logo.
 *
 * The last row of the logo <pre> contains two `:` characters. Two `:` columns
 * drop straight down from them, land on the top edge of a box drawn with `.`
 * (horizontal) and `:` (vertical), and the box wraps the content element.
 *
 * The top edge can be replaced by a `header`: a few rows of line art (taken
 * from the top of the logo) that is stretched to the box width by inserting
 * cells at columns that are blank in every header row, or squeezed by
 * removing such columns. When it cannot be made to fit, the plain edge is used.
 *
 * The outline is a <pre> of one <span> per cell, absolutely positioned so that
 * its character grid is snapped to the logo's grid. Each span gets a step index
 * (`--i`) equal to its path distance from the logo, so a CSS animation-delay
 * makes the outline appear cell by cell: down the feeders, across the header
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
   * @param {string[]} [config.header]       Rows of line art used as the box's top
   * @param {number[]} [config.feederCols]   Logo columns of the two `:` (default: found in the last logo row)
   * @param {number} [config.stepMs]         Delay between two cells appearing
   * @param {number} [config.startDelay]     ms before the first cell appears
   * @param {number} [config.paddingRows]    Blank rows between the top edge/header and the content
   * @param {string} [config.vChar]          Character for vertical runs
   * @param {string} [config.hChar]          Character for horizontal runs
   */
  constructor(config) {
    this.logo = config.logo;
    this.box = config.box;
    this.outline = config.outline;
    this.content = config.content || null;
    this.header = config.header || null;
    this.feederCols = config.feederCols || null;
    this.stepMs = config.stepMs ?? 30;
    this.startDelay = config.startDelay ?? 600;
    this.paddingRows = config.paddingRows ?? 1;
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

  /**
   * Stretch or squeeze the header rows to `cols` columns. Cells are added at
   * two blank columns (one per half) or removed from blank columns spread over
   * the width. Returns null when the rows cannot be made to fit.
   */
  fitHeader(cols) {
    if (!this.header || this.header.length === 0) return null;
    const width = Math.max(...this.header.map((r) => r.length));
    const rows = this.header.map((r) => [...r.padEnd(width, " ")]);
    const blank = [];
    for (let c = 0; c < width; c++) {
      if (rows.every((r) => r[c] === " ")) blank.push(c);
    }
    const extra = cols - width;
    if (extra === 0) return rows.map((r) => r.join(""));
    if (blank.length === 0) return null;

    const nearest = (target) =>
      blank.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));

    if (extra > 0) {
      const cutL = nearest(width * 0.2);
      const cutR = nearest(width * 0.8);
      const addL = Math.floor(extra / 2);
      const addR = extra - addL;
      return rows.map((r) => {
        const out = [];
        for (let c = 0; c < width; c++) {
          if (c === cutL) out.push(..." ".repeat(addL));
          if (c === cutR) out.push(..." ".repeat(addR));
          out.push(r[c]);
        }
        return out.join("");
      });
    }

    // squeeze: drop blank columns spread evenly over the width
    const remove = -extra;
    if (remove > blank.length) return null;
    const drop = new Set();
    for (let i = 0; i < remove; i++) {
      drop.add(blank[Math.round(((i + 0.5) * blank.length) / remove - 0.5)]);
    }
    // rounding can pick the same column twice; fill from the remaining ones
    for (const c of blank) {
      if (drop.size >= remove) break;
      drop.add(c);
    }
    return rows.map((r) => r.filter((_, c) => !drop.has(c)).join(""));
  }

  /** Build the character grid and step index per cell, then write the spans. */
  render() {
    this.measureCell();
    const feeders = this.findFeederCols();
    const cw = this.cellW;
    const ch = this.cellH;

    // the box is as wide as CSS makes it; the header decides the top padding
    const boxWidth = this.box.getBoundingClientRect().width;
    const cols = Math.floor(boxWidth / cw);
    const header = this.fitHeader(cols);
    const headerRows = header ? header.length : 1;
    this.box.style.paddingTop = `${headerRows + this.paddingRows}lh`;

    const logoRect = this.logo.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect();

    // Snap the outline grid to the logo grid: column c of the outline sits
    // under logo column c + shift.
    const shift = Math.round((boxRect.left - logoRect.left) / cw);
    const left = logoRect.left + shift * cw - boxRect.left;
    const top = logoRect.bottom - boxRect.top;

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
    const kinds = new Array(rows * cols).fill("");
    const put = (r, c, chr, step, kind = "") => {
      const i = r * cols + c;
      chars[i] = chr;
      kinds[i] = kind;
      steps[i] = steps[i] < 0 ? step : Math.min(steps[i], step);
    };

    // feeders: straight down from the logo onto the top edge
    for (const c of landings) {
      for (let r = 0; r < feederRows; r++) put(r, c, this.vChar, r);
    }
    const distTop = (c) =>
      landings.length ? Math.min(...landings.map((l) => Math.abs(c - l))) : c;

    let sidesFrom; // first row of the plain `:` sides
    let leftStart; // step at which the left side starts growing
    let rightStart;
    if (header) {
      // header: a wave spreading from the landing points over the line art
      for (let r = 0; r < header.length; r++) {
        for (let c = 0; c <= lastCol; c++) {
          const chr = header[r][c] ?? " ";
          if (chr === " ") continue;
          put(topRow + r, c, chr, feederRows + distTop(c) + r,
              chr === this.vChar || chr === this.hChar ? "" : "line");
        }
      }
      for (const c of landings) {
        if (chars[topRow * cols + c] === " ") put(topRow, c, this.vChar, feederRows);
      }
      sidesFrom = topRow + header.length;
      leftStart = feederRows + distTop(0) + header.length;
      rightStart = feederRows + distTop(lastCol) + header.length;
    } else {
      // plain top edge, growing away from each landing point
      for (let c = 0; c <= lastCol; c++) {
        put(topRow, c, this.hChar, feederRows + distTop(c));
      }
      put(topRow, 0, this.vChar, feederRows + distTop(0));
      put(topRow, lastCol, this.vChar, feederRows + distTop(lastCol));
      for (const c of landings) put(topRow, c, this.vChar, feederRows);
      sidesFrom = topRow + 1;
      leftStart = feederRows + distTop(0) + 1;
      rightStart = feederRows + distTop(lastCol) + 1;
    }

    // sides, growing down from the corners
    for (let r = sidesFrom; r < bottomRow; r++) {
      put(r, 0, this.vChar, leftStart + (r - sidesFrom));
      put(r, lastCol, this.vChar, rightStart + (r - sidesFrom));
    }
    // bottom edge, closing in from both corners
    const leftBottom = leftStart + (bottomRow - sidesFrom);
    const rightBottom = rightStart + (bottomRow - sidesFrom);
    for (let c = 0; c <= lastCol; c++) {
      put(bottomRow, c, this.hChar, Math.min(leftBottom + c, rightBottom + (lastCol - c)));
    }
    put(bottomRow, 0, this.vChar, leftBottom);
    put(bottomRow, lastCol, this.vChar, rightBottom);

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
        const cls = kinds[i] ? ` class="${kinds[i]}"` : "";
        line += `<span${cls} style="--i:${steps[i]}">${chars[i]}</span>`;
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
