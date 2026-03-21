// font-switcher.js
export default class FontSwitcher {
  /**
   * Creates a new FontSwitcher instance
   * @param {string} selectorId - The ID of the select element
   */
  constructor(selectorId) {
    this.selectorId = selectorId;

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the font switcher
   */
  init() {
    // Get the selector element
    this.selector = document.getElementById(this.selectorId);

    if (!this.selector) {
      console.error(
        `FontSwitcher: Element with ID "${this.selectorId}" not found`
      );
      return;
    }

    // Apply initial font
    this.applyFont(this.selector.value);

    // Add change listener
    this.selector.addEventListener("change", () => {
      this.applyFont(this.selector.value);
    });
  }

  applyFont(fontName) {
    // 1. Disable animations
    document.documentElement.classList.add("no-animations");

    // 2. Set the font
    document.body.style.fontFamily = `"${fontName}", sans-serif`;

    // 3. Aggressively detach and reattach body content
    const body = document.body;
    const parent = body.parentNode;
    const next = body.nextSibling;

    // Detach
    parent.removeChild(body);

    // Force reflow (read property)
    void document.documentElement.offsetHeight;

    // Reattach in next frame
    requestAnimationFrame(() => {
      if (next) {
        parent.insertBefore(body, next);
      } else {
        parent.appendChild(body);
      }

      // Force another reflow
      void document.body.offsetHeight;

      // 4. Remove no-animations class
      document.documentElement.classList.remove("no-animations");

      // 5. Hint for GC/rendering cleanup (mostly for Chrome)
      if (window.gc) window.gc();
    });
  }
}
