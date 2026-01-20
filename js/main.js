/**
 * Main SPA Entry Point
 * Initializes the router and handles font loading
 * Includes preloading of heavy animation assets
 */

import { Router, checkSpaRedirect } from './router.js';
import { loadPage } from './loadPage.js';
import { saveFontSelection } from './saveFontSelection.js';
import { preloadAssets, hideLoadingScreen } from './preloader.js';
import { init as initHomePage } from './pages/homePage.js';
import { init as initCodePage } from './pages/codePage.js';
import { init as initLinksPage } from './pages/linksPage.js';

// Router instance
let router = null;

/**
 * Define routes
 * Each route returns a cleanup function
 */
const routes = {
  '/': async (container) => {
    return await initHomePage(container);
  },
  '/code': async (container) => {
    return await initCodePage(container);
  },
  '/links': async (container) => {
    return await initLinksPage(container);
  },
  '/404': async (container) => {
    // Simple 404 page
    container.innerHTML = `
      <div class="center" style="text-align: center; padding: 4rem;">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" data-link class="link-line">Go Home</a>
      </div>
    `;
    return () => {};
  }
};

/**
 * Initialize the SPA
 */
function initApp() {
  const appContainer = document.getElementById('app');

  if (!appContainer) {
    console.error('App container #app not found');
    return;
  }

  // Create router
  router = new Router(routes, {
    appContainer: appContainer,
    onAfterNavigate: (path) => {
      // Update document title based on route
      const titles = {
        '/': "Jeppe Marquardt's Portfolio",
        '/code': "Code - Jeppe Marquardt",
        '/links': "Links - Jeppe Marquardt",
      };
      document.title = titles[path] || "Jeppe Marquardt's Portfolio";

      // Scroll to top on navigation
      window.scrollTo(0, 0);
    }
  });

  // Check for SPA redirect from 404.html (GitHub Pages workaround)
  const redirectPath = checkSpaRedirect();
  if (redirectPath) {
    router.navigate(redirectPath, false);
  } else {
    // Handle initial route
    router.handleRoute();
  }
}

/**
 * Initialize font selector
 */
function initFontSelector() {
  // Wait for nav-bar to be defined and rendered
  const checkFontSelector = () => {
    const fontSelector = document.getElementById('font-selector');
    if (fontSelector) {
      fontSelector.addEventListener('change', (e) => {
        const selectedFont = e.target.value;
        saveFontSelection(selectedFont);
      });
    } else {
      // Retry after a short delay if not found yet
      setTimeout(checkFontSelector, 100);
    }
  };
  checkFontSelector();
}

/**
 * Main initialization
 * 1. Preloads heavy animation assets while loading screen is visible
 * 2. Loads fonts
 * 3. Initializes the app
 * 4. Hides loading screen (after minimum 2s display time)
 */
async function main() {
  try {
    // Start preloading heavy assets while loading screen is visible
    await preloadAssets();
    
    // Load fonts, then initialize app
    loadPage(async () => {
      // Initialize the SPA router and app
      initApp();
      initFontSelector();
      
      // Mark body as loaded for CSS transitions
      document.body.classList.add('loaded');
      
      // Hide loading screen (waits for minimum 2s total)
      await hideLoadingScreen();
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Still try to hide loading screen on error
    await hideLoadingScreen();
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Export router for potential external use
export { router };
