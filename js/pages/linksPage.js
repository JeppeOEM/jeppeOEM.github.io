/**
 * Links Page Module
 * Handles initialization and cleanup for the links page
 */

import AsciiBox from "../AsciiBox.js";
import { charAnimation } from "../charAnimation.js";

// Track resources for cleanup
let asciiBox = null;
let animationTimeouts = [];
let animationFrameIds = [];

/**
 * Initialize the links page
 * @param {HTMLElement} container - The app container element
 * @returns {Function} Cleanup function
 */
export async function init(container) {
  // Clone the template
  const template = document.getElementById('links-template');
  if (!template) {
    console.error('Links template not found');
    return cleanup;
  }

  const content = template.content.cloneNode(true);
  container.appendChild(content);

  // Initialize after content is in DOM
  initializePage();

  return cleanup;
}

/**
 * Initialize page-specific functionality
 */
function initializePage() {
  // Initialize ASCII box
  const templateClosestChild = document.querySelector(".outer");
  const outerTemplate = document.getElementById("outer-template");

  if (outerTemplate) {
    asciiBox = new AsciiBox({
      templateClosestChild: templateClosestChild,
      template: outerTemplate,
      mobileBreakpoint: {
        horizontalChars: 42,
        verticalLines: 10,
        verticalHeaderLines: 8,
        breakpoint: 480,
      },
      tabletBreakpoint: {
        horizontalChars: 60,
        verticalLines: 20,
        verticalHeaderLines: 0,
        breakpoint: 768,
      },
      desktopBreakpoint: {
        horizontalChars: 80,
        verticalHeaderLines: 0,
        verticalLines: 10,
      },
      styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 2000ms;
}
    .fade-in-box.show {
    }

    @keyframes fadeSlideScale {
        0% {
            opacity: 0;
            transform: translateY(200%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(0%) scale(0.5);
        }
        100% {
            opacity: 1;
            transform: translateY(0%) scale(1);
        }
    }
`,
    });

    asciiBox.init();
  }

  // Start character animations with cleanup tracking
  // Characters match the ASCII art in the links logo:
  // ═══════ (double horizontal lines) for borders
  // :::::::: for colon rows
  // :░:░:░:░ for the middle pattern row
  const animations = [
    { selector: ".borderTopLeft", delay: 2, delayStart: 700, chars: "═══════", color: "var(--white)" },
    { selector: ".charTopLeft", delay: 2, delayStart: 650, chars: "::::::::" },
    { selector: ".charSecondTopLeft", delay: 2, delayStart: 600, chars: "::::::::" },
    { selector: ".centerDivLeft", delay: 4, delayStart: 600, chars: ":░:░:░:░", color: "var(--white)" },
    { selector: ".charSecondBottomLeft", delay: 2, delayStart: 600, chars: "::::::::" },
    { selector: ".charBottomLeft", delay: 2, delayStart: 650, chars: "::::::::" },
    { selector: ".bottomBorderLeft", delay: 2, delayStart: 700, chars: "═══════", color: "var(--white)" },
    { selector: ".borderTop", delay: 2, delayStart: 700, chars: "═══════", color: "var(--white)" },
    { selector: ".charTop", delay: 2, delayStart: 650, chars: "::::::::" },
    { selector: ".charSecondTop", delay: 2, delayStart: 600, chars: "::::::::" },
    { selector: ".centerDiv", delay: 4, delayStart: 600, chars: ":░:░:░:░", color: "var(--white)" },
    { selector: ".charSecondBottom", delay: 2, delayStart: 600, chars: "::::::::" },
    { selector: ".charBottom", delay: 2, delayStart: 650, chars: "::::::::" },
    { selector: ".bottomBorder", delay: 2, delayStart: 700, chars: "═══════", color: "var(--white)" },
  ];

  animations.forEach(({ selector, delay, delayStart, chars, color }) => {
    const element = document.querySelector(selector);
    if (element) {
      startCharAnimationWithCleanup(element, delay, delayStart, chars, color);
    }
  });
}

/**
 * Start a character animation with cleanup tracking
 */
function startCharAnimationWithCleanup(element, delay, delayStart, chars, color) {
  const timeoutId = setTimeout(() => {
    charAnimation(element, delay, 0, chars, color || "var(--light-blue)");
  }, delayStart);
  
  animationTimeouts.push(timeoutId);
}

/**
 * Cleanup function - called when navigating away from the page
 */
export function cleanup() {
  // Cancel animation timeouts
  animationTimeouts.forEach(timeoutId => {
    clearTimeout(timeoutId);
  });
  animationTimeouts = [];

  // Cancel animation frames
  animationFrameIds.forEach(frameId => {
    cancelAnimationFrame(frameId);
  });
  animationFrameIds = [];

  // Destroy AsciiBox
  if (asciiBox) {
    asciiBox.destroy();
    asciiBox = null;
  }

  // Remove injected styles
  const fadeStyle = document.getElementById('ascii-fade-style');
  if (fadeStyle) {
    fadeStyle.remove();
  }

  // Remove any ascii-box-wrapper elements
  document.querySelectorAll('.ascii-box-wrapper').forEach(el => el.remove());
}
