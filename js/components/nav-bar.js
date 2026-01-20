/**
 * Navigation Bar Web Component
 * Provides SPA navigation with data-link attributes
 */

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
            <a href="/" class="nav__link" data-link><span class="bracket">[</span>HOME<span class="bracket">]</span></a>
            <a href="/code" class="nav__link" data-link><span class="bracket">[</span>CODE<span class="bracket">]</span></a>
            <a href="/links" class="nav__link" data-link><span class="bracket">[</span>LINKS<span class="bracket">]</span></a>
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

        // Update active link based on current path
        this.updateActiveLink();
    }

    /**
     * Update the active state of navigation links based on current path
     */
    updateActiveLink() {
        const currentPath = this.normalizePath(window.location.pathname);
        
        this.querySelectorAll('a[data-link]').forEach(link => {
            const linkPath = this.normalizePath(link.getAttribute('href'));
            link.classList.toggle('active', linkPath === currentPath);
        });
    }

    /**
     * Normalize a path for comparison
     */
    normalizePath(path) {
        // Handle .html extensions
        path = path.replace(/\.html$/, '');
        
        // Ensure leading slash
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Remove trailing slash (except for root)
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // Map /index to /
        if (path === '/index') {
            path = '/';
        }

        return path;
    }
}

customElements.define('nav-bar', NavBar);
