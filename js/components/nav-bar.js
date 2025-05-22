class NavBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
    <div class="nav-wrapper">
      <nav class="nav">
        <div class="navbar-side"></div>
        <div class="navbar">
          <div>
            <a href="/" class="nav__link"><span class="bracket">[</span>HOME<span class="bracket">]</span></a>
            <a href="code.html" class="nav__link" data-link><span class="bracket">[</span>CODE<span class="bracket">]</span></a>
            <a href="/links.html" class="nav__link" data-link><span class="bracket">[</span>LINKS<span class="bracket">]</span></a>
          </div>
          <div>
            <span class="font-controls"><span class="bracket">[</span><label for="font-selector">FONT:</label><select id="font-selector">
                <option value="IBMVGA8">IBM VGA 8x16</option>
                <option value="IBMBIOS2Y">IBM BIOS-2y</option></select><span class="bracket">]</span></span>
          </div>
        </div>
        <div class="navbar-side"></div>
      </nav>
    </div>
    `;

        const fontSelector = this.querySelector('#font-selector');
        // Get font from localStorage
        const savedFont = localStorage.getItem('selectedFont');
        if (savedFont && fontSelector) {
            fontSelector.value = savedFont;
            // Optionally apply it globally
            document.body.style.fontFamily = savedFont;
        }
        // Listen for changes and update localStorage
    }
}
customElements.define('nav-bar', NavBar);
