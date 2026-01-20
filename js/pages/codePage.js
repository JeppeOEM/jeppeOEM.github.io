/**
 * Code Page Module
 * Handles initialization and cleanup for the code/projects page
 */

import AsciiBackground from "../AsciiBackground.js";
import AsciiBox from "../AsciiBox.js";
import AsciiLogoBackground from "../AsciiLogoBackground.js";
import { patterns } from "../asciiPatterns.js";
import { startBinaryAnimation } from "../binaryAnimation.js";
import { leftPre, rightPre } from "../codeBackground.js";

// Track resources for cleanup
let asciiBox = null;
let bodyBackground = null;
let logoBackground = null;
let binaryTimeouts = [];

/**
 * Initialize the code page
 * @param {HTMLElement} container - The app container element
 * @returns {Function} Cleanup function
 */
export async function init(container) {
  // Clone the template
  const template = document.getElementById('code-template');
  if (!template) {
    console.error('Code template not found');
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
  // Create ASCII background
  bodyBackground = new AsciiBackground({
    asciiArt: patterns.pattern1,
    container: document.body,
    style: {
      color: "var(--dark-green)",
      opacity: 1,
      zIndex: -1,
    },
  });

  if (bodyBackground) {
    const background = document.querySelector(".ascii-background");
    if (background) {
      background.classList.add("fade-in-bg");
    }
  }

  // Setup logo background sections
  const leftSection = document.getElementById("leftSection");
  const rightSection = document.getElementById("rightSection");
  const logoPre = document.querySelector(".center-pre");

  if (leftSection && rightSection && logoPre) {
    logoBackground = new AsciiLogoBackground({
      leftSection: leftSection,
      rightSection: rightSection,
      leftPre: leftPre,
      rightPre: rightPre,
      logoPre: logoPre,
    });

    logoBackground.fillSections();
    logoBackground.init();
  }

  // Initialize ASCII box
  const templateClosestChild = document.querySelector(".outer");
  const outerTemplate = document.getElementById("outer-template");

  if (outerTemplate) {
    asciiBox = new AsciiBox({
      templateClosestChild: templateClosestChild,
      template: outerTemplate,
      mobileBreakpoint: {
        horizontalChars: 42,
        verticalLines: 20,
        breakpoint: 480,
      },
      tabletBreakpoint: {
        horizontalChars: 42,
        verticalLines: 20,
        breakpoint: 481,
      },
      desktopBreakpoint: {
        horizontalChars: 80,
        verticalLines: 5,
      },
      delay: 8800,
      styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 3500ms;
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

  // Start binary animations
  const leftDiv = document.querySelector(".leftDiv");
  if (leftDiv) {
    binaryTimeouts.push(startBinaryAnimationWithCleanup(leftDiv, 3, 600));
  }

  const topLeftDiv = document.querySelector(".topLeftDiv");
  if (topLeftDiv) {
    binaryTimeouts.push(startBinaryAnimationWithCleanup(topLeftDiv, 3, 800));
  }

  const bottomLeftDiv = document.querySelector(".bottomLeftDiv");
  if (bottomLeftDiv) {
    binaryTimeouts.push(startBinaryAnimationWithCleanup(bottomLeftDiv, 3, 900));
  }
}

/**
 * Wrapper for binary animation that returns a cancel function
 */
function startBinaryAnimationWithCleanup(element, delay, delayStart) {
  let cancelled = false;
  
  const timeoutId = setTimeout(() => {
    if (cancelled) return;
    startBinaryAnimation(element, delay, 0);
  }, delayStart);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}

/**
 * Cleanup function - called when navigating away from the page
 */
export function cleanup() {
  // Cancel binary animation timeouts
  binaryTimeouts.forEach(cancelFn => {
    if (typeof cancelFn === 'function') {
      cancelFn();
    }
  });
  binaryTimeouts = [];

  // Destroy AsciiBox
  if (asciiBox) {
    asciiBox.destroy();
    asciiBox = null;
  }

  // Destroy body background
  if (bodyBackground) {
    bodyBackground.destroy();
    bodyBackground = null;
  }

  // Cleanup logo background (remove resize listener)
  if (logoBackground) {
    window.removeEventListener("resize", logoBackground.fillSections);
    logoBackground = null;
  }

  // Remove injected styles
  const fadeStyle = document.getElementById('ascii-fade-style');
  if (fadeStyle) {
    fadeStyle.remove();
  }

  // Remove any ascii-box-wrapper elements
  document.querySelectorAll('.ascii-box-wrapper').forEach(el => el.remove());

  // Remove ascii background element
  document.querySelectorAll('.ascii-background').forEach(el => el.remove());
}
