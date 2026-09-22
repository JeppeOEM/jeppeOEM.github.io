/**
 * Dotted outline that grows out of a logo.
 *
 * The last row of the logo <pre> contains two `:` characters. Two `:` columns
 * drop straight down from them, land on the top edge of a box drawn with `.`
 * (horizontal) and `:` (vertical), and the box wraps the content element.
 *
 * A `header` of line art (taken from the top of the logo, on the logo's own
 * columns) can hang above the top edge, one cell wider than the box on each
 * side so it sits outside the dotted line. Because the header text shares the
 * logo's column grid, the header columns that line up with the two feeders
 * are known without measuring anything; those two columns, and everything
 * between them, are kept fixed so they stay under the feeders. Only the
 * columns outside that span are stretched to fit, by inserting cells at
 * columns that are blank in every header row, or squeezed by removing such
 * columns; when a side cannot be made to fit it is left out. The dotted line
 * is never altered by the header: header cells only fill cells the outline
 * leaves empty.
 *
 * The outline is a <pre> of one <span> per cell, absolutely positioned so that
 * its character grid is snapped to the logo's grid. Each span is an inline
 * block exactly one measured logo cell wide, so the grid stays on the logo's
 * columns even where a browser synthesises the bold weight with a rounded
 * advance (Firefox). Each span gets a step index
 * (`--i`) equal to its path distance from the logo, so a CSS animation-delay
 * makes the outline appear cell by cell: down the feeders (the header lines
 * spread sideways from them as they pass), along the top edge from the two
 * landing points, down the sides and along the bottom edge until it closes in
 * the middle.
 */
export default class DotBox {
  /**
   * @param {Object} config
   * @param {HTMLElement} config.logo        The logo <pre>
   * @param {HTMLElement} config.box         Wrapper the outline is positioned in
   * @param {HTMLElement} config.outline     <pre> that receives the cells
   * @param {HTMLElement} [config.content]   Element faded in once the outline closes
   * @param {string[]} [config.header]       Rows of line art hung above the top edge
   * @param {number} [config.feederGap]      Blank rows between the logo and the header
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
    this.header = config.header || null;
    this.feederCols = config.feederCols || null;
    this.stepMs = config.stepMs ?? 30;
    this.startDelay = config.startDelay ?? 600;
    this.feederGap = config.feederGap ?? 2;
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
   * Stretch or squeeze equal-length `rows` to `target` columns. Cells are
   * added at two blank columns (one per half) or removed from blank columns
   * spread over the width. Returns an array of char arrays, or null when the
   * rows cannot be made to fit.
   */
  stretchRows(rows, target) {
    const width = rows[0] ? rows[0].length : 0;
    const grid = rows.map((r) => [...r]);
    if (width === target) return grid;

    const blank = [];
    for (let c = 0; c < width; c++) {
      if (grid.every((r) => r[c] === " ")) blank.push(c);
    }
    const extra = target - width;
    if (blank.length === 0) return null;

    const nearest = (t) => blank.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));

    if (extra > 0) {
      const cutL = nearest(width * 0.2);
      const cutR = nearest(width * 0.8);
      const addL = Math.floor(extra / 2);
      const addR = extra - addL;
      return grid.map((r) => {
        const out = [];
        for (let c = 0; c < width; c++) {
          if (c === cutL) out.push(..." ".repeat(addL));
          if (c === cutR) out.push(..." ".repeat(addR));
          out.push(r[c]);
        }
        return out;
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
    return grid.map((r) => r.filter((_, c) => !drop.has(c)));
  }

  /**
   * Fit the header to `cols` columns. `localLandings` are the two columns in
   * the header's own text (the logo's grid) that line up with the feeders;
   * `outLandings` are where those feeders actually land in the outline grid.
   * The span between the landings is copied verbatim so it stays put; only
   * the columns outside it are stretched or squeezed. Falls back to
   * stretching the whole header when there aren't exactly two landings on
   * both sides. Returns null when it cannot be made to fit.
   */
  fitHeader(cols, localLandings, outLandings) {
    if (!this.header || this.header.length === 0) return null;
    const width = Math.max(...this.header.map((r) => r.length));
    const rows = this.header.map((r) => r.padEnd(width, " "));

    if (localLandings.length !== 2 || outLandings.length !== 2) {
      const grid = this.stretchRows(rows, cols);
      return grid ? grid.map((r) => r.join("")) : null;
    }

    const [lLocal, rLocal] = localLandings;
    const [lOut, rOut] = outLandings;

    const leftRows = rows.map((r) => r.slice(0, lLocal));
    const midRows = rows.map((r) => r.slice(lLocal, rLocal + 1));
    const rightRows = rows.map((r) => r.slice(rLocal + 1));

    const left = this.stretchRows(leftRows, lOut);
    const right = this.stretchRows(rightRows, cols - rOut - 1);
    if (!left || !right) return null;

    return rows.map((_, i) => left[i].join("") + midRows[i] + right[i].join(""));
  }

  /** Build the character grid and step index per cell, then write the spans. */
  render() {
    this.measureCell();
    const feeders = this.findFeederCols();
    const cw = this.cellW;
    const ch = this.cellH;
    // pin each cell to the logo's advance so a synthesised bold cannot widen it
    this.outline.style.setProperty("--dot-cell", `${cw}px`);

    // the box is as wide as CSS makes it; the header hangs in its top margin
    const boxWidth = this.box.getBoundingClientRect().width;
    const boxCols = Math.floor(boxWidth / cw);

    // Snap the outline grid to the logo grid: column c of the outline sits
    // under logo column c + shift. This only depends on horizontal position,
    // which margin-top doesn't change, so it can be settled before the
    // header (which decides how tall that top margin needs to be) is fit.
    const geoFor = (pad) => {
      const logoRect = this.logo.getBoundingClientRect();
      const boxRect = this.box.getBoundingClientRect();
      const shift = Math.round((boxRect.left - logoRect.left) / cw) - pad;
      const cols = boxCols + 2 * pad;
      const firstCol = pad;
      const lastCol = pad + boxCols - 1;
      const landings = feeders
        .map((c) => c - shift)
        .filter((c) => c > firstCol && c < lastCol);
      return { shift, cols, firstCol, lastCol, landings };
    };

    let pad = this.header ? 1 : 0; // grid columns outside the box on each side
    let geo = geoFor(pad);
    let header = this.header ? this.fitHeader(geo.cols, feeders, geo.landings) : null;
    if (this.header && !header) {
      pad = 0;
      geo = geoFor(pad);
    }
    const { shift, cols, firstCol, lastCol, landings } = geo;

    this.box.style.marginTop = `${this.feederGap + (header ? this.header.length : 1)}lh`;

    const logoRect = this.logo.getBoundingClientRect();
    const boxRect = this.box.getBoundingClientRect();
    const left = logoRect.left + shift * cw - boxRect.left;
    const top = logoRect.bottom - boxRect.top;

    const feederRows = Math.max(1, Math.round((boxRect.top - logoRect.bottom) / ch));
    const rows = feederRows + Math.round(boxRect.height / ch);

    const topRow = feederRows;
    const bottomRow = rows - 1;

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
    // top edge, growing away from each landing point
    const distTop = (c) =>
      landings.length ? Math.min(...landings.map((l) => Math.abs(c - l))) : c;
    for (let c = firstCol; c <= lastCol; c++) {
      put(topRow, c, this.hChar, feederRows + distTop(c));
    }
    // sides, growing down from the corners
    const leftStart = feederRows + distTop(firstCol);
    const rightStart = feederRows + distTop(lastCol);
    for (let r = topRow + 1; r < bottomRow; r++) {
      put(r, firstCol, this.vChar, leftStart + (r - topRow));
      put(r, lastCol, this.vChar, rightStart + (r - topRow));
    }
    // bottom edge, closing in from both corners
    const leftBottom = leftStart + (bottomRow - topRow);
    const rightBottom = rightStart + (bottomRow - topRow);
    for (let c = firstCol; c <= lastCol; c++) {
      put(bottomRow, c, this.hChar,
          Math.min(leftBottom + (c - firstCol), rightBottom + (lastCol - c)));
    }
    // corners and landing cells read as joints
    put(topRow, firstCol, this.vChar, leftStart);
    put(topRow, lastCol, this.vChar, rightStart);
    put(bottomRow, firstCol, this.vChar, leftBottom);
    put(bottomRow, lastCol, this.vChar, rightBottom);
    for (const c of landings) put(topRow, c, this.vChar, feederRows);

    // header: hangs directly above the top edge, spreading sideways from the
    // feeders as they pass; it never overwrites a cell of the dotted line
    if (header) {
      const headerTop = Math.max(0, topRow - header.length);
      for (let r = 0; r < header.length; r++) {
        const row = headerTop + r;
        if (row >= topRow) break;
        for (let c = 0; c < cols; c++) {
          const chr = header[r][c] ?? " ";
          if (chr === " " || chars[row * cols + c] !== " ") continue;
          put(row, c, chr, row + distTop(c),
              chr === this.vChar || chr === this.hChar ? "" : "line");
        }
      }
    }

    let total = 0;
    const html = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
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
