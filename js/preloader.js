/**
 * Preloader Module
 * Handles asset preloading and loading screen management
 * 
 * Shows an ASCII spinner while heavy animation modules are loaded in parallel.
 * Ensures a minimum display time for the loading screen to prevent jarring flashes.
 */

// Track when preloading started
let preloadStartTime = 0;
const MINIMUM_LOADING_TIME = 2000; // 2 seconds minimum display

/**
 * Preloads heavy animation modules in parallel
 * This runs while the loading screen is visible
 * @returns {Promise<void>}
 */
export async function preloadAssets() {
  preloadStartTime = Date.now();
  
  const criticalModules = [
    // Animation engine core
    import('/src/run.js'),
    import('/src/core/textrenderer.js'),
    import('/src/core/canvasrenderer.js'),
    import('/src/core/fps.js'),
    import('/src/core/storage.js'),
    
    // Slime simulation (home page)
    import('/src/programs/contributed/slime_dish2.js'),
    import('/src/modules/vec2.js'),
    import('/src/modules/num.js'),
    
    // UI components used across pages
    import('./AsciiBox.js'),
    import('./AsciiBackground.js'),
    import('./AsciiLogoBackground.js'),
    
    // Page modules
    import('./pages/homePage.js'),
    import('./pages/codePage.js'),
    import('./pages/linksPage.js'),
  ];

  try {
    // Wait for all modules to load in parallel
    await Promise.all(criticalModules);
    console.log('All critical modules preloaded');
  } catch (error) {
    // Log but don't fail - modules will be loaded on demand if preload fails
    console.warn('Some modules failed to preload:', error);
  }
}

/**
 * Hides the loading screen after minimum time has passed
 * Waits for the remaining time if preloading finished early
 * @returns {Promise<void>}
 */
export async function hideLoadingScreen() {
  const elapsed = Date.now() - preloadStartTime;
  const remaining = MINIMUM_LOADING_TIME - elapsed;
  
  // Wait for minimum time if needed
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }
  
  const loader = document.getElementById('loading-screen');
  if (loader) {
    // Add hidden class to trigger fade-out animation
    loader.classList.add('hidden');
    
    // Remove from DOM after fade animation completes
    setTimeout(() => {
      loader.remove();
      // Also remove the inline styles
      const loaderStyles = document.getElementById('loader-styles');
      if (loaderStyles) {
        loaderStyles.remove();
      }
    }, 500);
  }
}

/**
 * Gets the elapsed loading time (useful for debugging)
 * @returns {number} Milliseconds since preloading started
 */
export function getLoadingTime() {
  return Date.now() - preloadStartTime;
}
