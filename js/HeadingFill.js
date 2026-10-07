/**
 * Section headings drawn as text: "%%%%%%%[ TITLE ]%%%%%%%".
 *
 * Each `.h3-fill` heading holds its title between two empty `.h3-fill-side`
 * spans. fit() measures the heading's width in characters (the page font is
 * monospace) and fills both sides with as many "%" as are needed for the line
 * to span the whole box, the title centred. The fill is real text, not CSS
 * content, so it reflows with the box and is drawn by the same character
 * animation as the rest of the box (js/TextScramble.js).
 *
 * The title must not change width while the box is animating: fit() is a
 * no-op while `root` carries the `scrambling` class, and the caller fits
 * again when the animation is over.
 */
export default class HeadingFill {
  /**
   * @param {HTMLElement} root       Element containing the headings
   * @param {string} [fillChar="%"]  Character the sides are filled with
   */
  constructor(root, fillChar = "%") {
    this.root = root;
    this.fillChar = fillChar;
    this.fit = this.fit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  /** Fit now and again whenever the window or the page font changes. */
  init() {
    this.fit();
    window.addEventListener("resize", this.onChange);
    // The font selector changes body's inline font-family; refit for new metrics.
    this.fontObserver = new MutationObserver(this.onChange);
    this.fontObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  /** Width of one character in the heading's font, in pixels. */
  measureCharWidth(heading) {
    const probe = document.createElement("span");
    probe.textContent = this.fillChar.repeat(100);
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      whiteSpace: "pre",
    });
    heading.appendChild(probe);
    const width = probe.getBoundingClientRect().width / 100;
    probe.remove();
    return width || 8;
  }

  fit() {
    if (this.root.classList.contains("scrambling")) return;
    for (const heading of this.root.querySelectorAll(".h3-fill")) {
      const sides = heading.querySelectorAll(".h3-fill-side");
      if (sides.length !== 2) continue;
      const charW = this.measureCharWidth(heading);
      // A box that is a whole number of characters wide can measure a hair
      // under it; the tolerance keeps that from costing a column.
      const cols = Math.floor(heading.getBoundingClientRect().width / charW + 0.1);
      // title width: every character of the heading that is not fill
      let title = 0;
      for (const node of heading.childNodes) {
        if (node === sides[0] || node === sides[1]) continue;
        title += [...node.textContent].length;
      }
      const free = Math.max(0, cols - title);
      const left = Math.floor(free / 2);
      sides[0].textContent = this.fillChar.repeat(left);
      sides[1].textContent = this.fillChar.repeat(free - left);
    }
  }

  onChange() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.fit();
    });
  }

  destroy() {
    window.removeEventListener("resize", this.onChange);
    if (this.fontObserver) this.fontObserver.disconnect();
  }
}
