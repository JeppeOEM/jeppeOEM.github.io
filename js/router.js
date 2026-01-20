/**
 * Simple SPA Router using History API
 * Provides clean URLs like /code, /links with browser back/forward support
 */

export class Router {
  constructor(routes, options = {}) {
    this.routes = routes;
    this.currentCleanup = null;
    this.currentPath = null;
    this.appContainer = options.appContainer || document.getElementById('app');
    this.onBeforeNavigate = options.onBeforeNavigate || null;
    this.onAfterNavigate = options.onAfterNavigate || null;

    // Bind methods
    this.handleRoute = this.handleRoute.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);

    // Handle browser back/forward
    window.addEventListener('popstate', this.handleRoute);

    // Intercept link clicks for SPA navigation
    document.addEventListener('click', this.handleLinkClick);
  }

  /**
   * Handle clicks on links with data-link attribute
   */
  handleLinkClick(e) {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      this.navigate(href);
    }
  }

  /**
   * Navigate to a new path
   * @param {string} path - The path to navigate to
   * @param {boolean} pushState - Whether to push to history (false for initial load)
   */
  navigate(path, pushState = true) {
    // Normalize path
    path = this.normalizePath(path);

    // Don't navigate if already on this path
    if (path === this.currentPath) {
      return;
    }

    if (pushState) {
      history.pushState(null, '', path);
    }

    this.handleRoute();
  }

  /**
   * Normalize a path (remove trailing slashes, ensure leading slash)
   */
  normalizePath(path) {
    // Handle .html extensions for backward compatibility
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

  /**
   * Handle the current route
   */
  async handleRoute() {
    const path = this.normalizePath(window.location.pathname);
    
    // Cleanup previous page
    if (this.currentCleanup) {
      try {
        await this.currentCleanup();
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
      this.currentCleanup = null;
    }

    // Clear app container
    if (this.appContainer) {
      this.appContainer.innerHTML = '';
    }

    // Before navigate callback
    if (this.onBeforeNavigate) {
      this.onBeforeNavigate(path);
    }

    // Find matching route
    const route = this.routes[path] || this.routes['/404'] || this.routes['/'];
    
    if (!route) {
      console.error(`No route found for path: ${path}`);
      return;
    }

    this.currentPath = path;

    // Execute route handler
    try {
      const cleanup = await route(this.appContainer);
      
      // Store cleanup function if provided
      if (typeof cleanup === 'function') {
        this.currentCleanup = cleanup;
      }
    } catch (e) {
      console.error('Route error:', e);
    }

    // After navigate callback
    if (this.onAfterNavigate) {
      this.onAfterNavigate(path);
    }

    // Update active nav link
    this.updateActiveNavLink(path);
  }

  /**
   * Update the active state of navigation links
   */
  updateActiveNavLink(path) {
    document.querySelectorAll('a[data-link]').forEach(link => {
      const linkPath = this.normalizePath(link.getAttribute('href'));
      link.classList.toggle('active', linkPath === path);
    });
  }

  /**
   * Destroy the router and cleanup
   */
  destroy() {
    window.removeEventListener('popstate', this.handleRoute);
    document.removeEventListener('click', this.handleLinkClick);
    
    if (this.currentCleanup) {
      this.currentCleanup();
      this.currentCleanup = null;
    }
  }
}

/**
 * Check for SPA redirect from 404.html (GitHub Pages workaround)
 * @returns {string|null} The redirect path if found
 */
export function checkSpaRedirect() {
  const redirect = sessionStorage.getItem('spa-redirect');
  if (redirect) {
    sessionStorage.removeItem('spa-redirect');
    return redirect;
  }
  return null;
}
