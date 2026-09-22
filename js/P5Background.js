/**
 * Full-viewport p5.js canvas behind the page, running one animation at a time.
 *
 * The canvas is fixed, pointer-transparent and sits under the content. Which
 * animation runs is decided by name from a registry (see js/animations/), so a
 * new background is one new module and one registry line, never a change here.
 *
 * Each animation is a plain object:
 *
 *   {
 *     name: "hexRain",
 *     setup(p, bg)   { ... }   // once, after the canvas exists (also after a resize)
 *     draw(p, bg)    { ... }   // every frame
 *     resize(p, bg)  { ... }   // optional; default re-runs setup
 *     pointer(p, bg, x, y, speed) { ... } // optional; pointer moved (viewport px, px/ms)
 *     holesChanged(p, bg) { ... }  // optional; excluded elements moved (scroll)
 *     destroy(p, bg) { ... }   // optional; when switched away from
 *   }
 *
 * `p` is the p5 instance (instance mode, nothing global). `bg` is this class,
 * which hands the animation what the page knows and p5 does not:
 *
 *   bg.colors      resolved CSS variables (canvas cannot read `var(--x)` itself)
 *   bg.font        the page's monospace font as a p5-usable family name
 *   bg.cellW/cellH size of one character cell of that font
 *   bg.holes       viewport rectangles behind excluded elements (leave them empty)
 *   bg.inHole(x, y) whether a viewport point is behind an excluded element
 *   bg.reducedMotion  the user asked for reduced motion: draw one still frame
 *
 * Elements listed in `exclude` are re-measured on scroll and resize, so an
 * animation that checks `bg.inHole` keeps the text box readable.
 */
export default class P5Background {
  /**
   * @param {Object} config
   * @param {Object<string, Object>} config.animations  name -> animation object
   * @param {string} [config.initial]             Name to start with (default: first key)
   * @param {HTMLElement} [config.container]      Element that receives the canvas (default: body)
   * @param {Object<string, string>} [config.colors]  name -> CSS color or `var(--x)` to resolve
   * @param {(string|HTMLElement)[]} [config.exclude]  Selectors/elements to keep clear
   * @param {number} [config.excludePadding]      Extra hole margin in character cells
   * @param {number} [config.zIndex]
   * @param {number} [config.frameRate]           Cap for p5's frame rate (default 30)
   */
  constructor(config) {
    if (typeof p5 === "undefined") {
      throw new Error("P5Background: p5.js is not loaded (add its <script> before this module)");
    }
    this.animations = config.animations;
    this.names = Object.keys(config.animations);
    if (this.names.length === 0) throw new Error("P5Background: no animations given");
    this.container = config.container || document.body;
    this.colorSpec = config.colors || {};
    this.exclude = config.exclude || [];
    this.excludePadding = config.excludePadding ?? 1;
    this.zIndex = config.zIndex ?? -1;
    this.frameRate = config.frameRate ?? 30;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** @type {Object<string, string>} */
    this.colors = {};
    this.font = "monospace";
    this.cellW = 8;
    this.cellH = 16;
    /** @type {{left: number, top: number, right: number, bottom: number}[]} */
    this.holes = [];

    this.current = null;
    this.currentName = "";
    this.pending = config.initial || this.names[0];
    this.p = null;
    this.ready = false;

    this.lastX = 0;
    this.lastY = 0;
    this.lastT = 0;

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  /** Wait for the page font, then create the p5 instance and start. */
  async init() {
    this.resolvePageStyle();
    try {
      await document.fonts.load(`16px ${this.font}`, "0");
      await document.fonts.ready;
    } catch (e) {
      /* fall through with whatever font is available */
    }
    this.measureCells();
    this.updateHoles();

    // eslint-disable-next-line no-undef
    this.p = new p5((p) => this.sketch(p), this.container);

    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize);

    // The font selector changes body's inline font-family; follow it.
    this.fontObserver = new MutationObserver(() => this.refont());
    this.fontObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
  }

  /** The p5 sketch: canvas creation plus dispatch to the current animation. */
  sketch(p) {
    p.setup = () => {
      const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      canvas.elt.className = "p5-background";
      Object.assign(canvas.elt.style, {
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: String(this.zIndex),
        pointerEvents: "none",
        userSelect: "none",
      });
      p.pixelDensity(window.devicePixelRatio || 1);
      p.frameRate(this.frameRate);
      p.textFont(this.font);
      p.textSize(this.fontSize);
      this.ready = true;
      this.run(this.pending);
      requestAnimationFrame(() => canvas.elt.classList.add("show"));
    };

    p.draw = () => {
      if (!this.current) return;
      this.current.draw(p, this);
      // One still frame is enough when the user asked for reduced motion.
      if (this.reducedMotion) p.noLoop();
    };

    // p5 owns the window resize; the animation gets to rebuild its state.
    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      this.measureCells();
      this.updateHoles();
      p.textFont(this.font);
      p.textSize(this.fontSize);
      if (!this.current) return;
      if (this.current.resize) this.current.resize(p, this);
      else this.current.setup(p, this);
      if (this.reducedMotion) p.redraw();
    };
  }

  /** Names of every registered animation. */
  list() {
    return [...this.names];
  }

  /** Switch to the animation called `name`. Unknown names are reported, not fatal. */
  run(name) {
    if (!this.animations[name]) {
      console.warn(`P5Background: no animation called "${name}" (have: ${this.names.join(", ")})`);
      return false;
    }
    if (!this.ready) {
      this.pending = name;
      return true;
    }
    const p = this.p;
    if (this.current && this.current.destroy) this.current.destroy(p, this);
    p.clear();
    p.resetMatrix();
    p.colorMode(p.RGB, 255);
    p.textFont(this.font);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();
    this.current = this.animations[name];
    this.currentName = name;
    this.current.setup(p, this);
    if (this.reducedMotion) p.redraw();
    else p.loop();
    return true;
  }

  /** Switch to the next animation in registry order (wraps around). */
  next() {
    const i = this.names.indexOf(this.currentName);
    return this.run(this.names[(i + 1) % this.names.length]);
  }

  /**
   * Canvas fill cannot read CSS variables, so resolve e.g. "var(--x)" to the
   * computed color through a temporary element. Also reads the body font.
   */
  resolvePageStyle() {
    const probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    for (const [name, value] of Object.entries(this.colorSpec)) {
      probe.style.color = value;
      this.colors[name] = getComputedStyle(probe).color || value;
    }
    probe.remove();

    const cs = getComputedStyle(document.body);
    this.fontSize = parseFloat(cs.fontSize) || 16;
    this.lineHeight = Number.isFinite(parseFloat(cs.lineHeight))
      ? parseFloat(cs.lineHeight)
      : this.fontSize;
    // p5.textFont wants one family name; take the first of the body's stack.
    this.font = (cs.fontFamily || "monospace").split(",")[0].trim().replace(/^["']|["']$/g, "");
  }

  /** Measure one character cell of the page font with a canvas 2D context. */
  measureCells() {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${this.fontSize}px ${this.font}`;
    this.cellW = ctx.measureText("0").width || this.fontSize * 0.5;
    this.cellH = this.lineHeight;
    this.cols = Math.ceil(window.innerWidth / this.cellW) + 1;
    this.rows = Math.ceil(window.innerHeight / this.cellH) + 1;
  }

  async refont() {
    const before = this.font;
    this.resolvePageStyle();
    if (this.font === before) return;
    try {
      await document.fonts.load(`16px ${this.font}`, "0");
    } catch (e) {}
    if (this.p) this.p.windowResized();
  }

  /** Recompute the viewport rectangles behind excluded elements. */
  updateHoles() {
    const padX = this.excludePadding * this.cellW;
    const padY = this.excludePadding * this.cellH;
    this.holes = [];
    for (const item of this.exclude) {
      const els = typeof item === "string" ? document.querySelectorAll(item) : [item];
      for (const el of els) {
        if (!el) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        this.holes.push({
          left: b.left - padX,
          top: b.top - padY,
          right: b.right + padX,
          bottom: b.bottom + padY,
        });
      }
    }
  }

  /** Whether the viewport point (x, y) lies behind an excluded element. */
  inHole(x, y) {
    for (const h of this.holes) {
      if (x >= h.left && x < h.right && y >= h.top && y < h.bottom) return true;
    }
    return false;
  }

  /** Whether the viewport rectangle overlaps an excluded element. */
  rectInHole(x0, y0, x1, y1) {
    for (const h of this.holes) {
      if (x1 > h.left && x0 < h.right && y1 > h.top && y0 < h.bottom) return true;
    }
    return false;
  }

  onPointerMove(e) {
    if (!this.ready || !this.current || !this.current.pointer) return;
    const now = performance.now();
    const dt = now - this.lastT;
    let speed = 0;
    if (this.lastT && dt > 0 && dt < 200) {
      speed = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY) / dt;
    }
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastT = now;
    this.current.pointer(this.p, this, e.clientX, e.clientY, speed);
    if (this.reducedMotion) this.p.redraw();
  }

  onScroll() {
    // The canvas is fixed but excluded elements scroll, so the holes move.
    if (this.exclude.length === 0) return;
    this.updateHoles();
    if (this.ready && this.current && this.current.holesChanged) {
      this.current.holesChanged(this.p, this);
    }
    if (this.reducedMotion && this.p) this.p.redraw();
  }

  onResize() {
    // p5 calls windowResized itself; this is only for holes when p5 is not up yet.
    if (!this.ready) this.updateHoles();
  }

  destroy() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    if (this.fontObserver) this.fontObserver.disconnect();
    if (this.current && this.current.destroy) this.current.destroy(this.p, this);
    if (this.p) this.p.remove();
    this.p = null;
    this.ready = false;
  }
}
