/**
 * Home Page Module
 * Handles initialization and cleanup for the home page
 */

import { run } from "/src/run.js";
import * as slimeProgram from "/src/programs/contributed/slime_dish2.js";
import AsciiBox from "../AsciiBox.js";

// Track resources for cleanup
let asciiBox = null;
let slimeTimeout = null;
let slimeElement = null;
let animationRunning = false;

/**
 * Initialize the home page
 * @param {HTMLElement} container - The app container element
 * @returns {Function} Cleanup function
 */
export async function init(container) {
  // Clone the template
  const template = document.getElementById('home-template');
  if (!template) {
    console.error('Home template not found');
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
  const templateClosestChild = document.querySelector(".outer");
  const template = document.getElementById("outer-template");
  
  if (template) {
    asciiBox = new AsciiBox({
      templateClosestChild: templateClosestChild,
      template: template,
      mobileBreakpoint: {
        horizontalChars: 35,
        verticalLines: 8,
        breakpoint: 514,
      },
      tabletBreakpoint: {
        horizontalChars: 35,
        verticalLines: 8,
        breakpoint: 515,
      },
      desktopBreakpoint: {
        horizontalChars: 70,
        verticalLines: 2,
      },
      delay: 7500,
      duration: 1500,
      styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 8000ms;
}
`,
    });

    asciiBox.init();
  }

  // Start slime animation with delay
  slimeElement = document.querySelector(".slime");
  if (slimeElement) {
    slimeTimeout = setTimeout(function () {
      animationRunning = true;
      run(slimeProgram, { element: slimeElement })
        .then(function (e) {
          console.log('Slime animation started', e);
        })
        .catch(function (e) {
          console.warn(e.message);
          console.log(e.error);
        });
    }, 2000);
  }
}

/**
 * Cleanup function - called when navigating away from the page
 */
export function cleanup() {
  // Clear timeout
  if (slimeTimeout) {
    clearTimeout(slimeTimeout);
    slimeTimeout = null;
  }

  // Destroy AsciiBox
  if (asciiBox) {
    asciiBox.destroy();
    asciiBox = null;
  }

  // Clear slime element content to stop animation
  // The run.js uses requestAnimationFrame internally, clearing the element
  // will cause the next frame to fail gracefully
  if (slimeElement) {
    slimeElement.innerHTML = '';
    slimeElement = null;
  }

  animationRunning = false;

  // Remove injected styles
  const fadeStyle = document.getElementById('ascii-fade-style');
  if (fadeStyle) {
    fadeStyle.remove();
  }

  // Remove any ascii-box-wrapper elements
  document.querySelectorAll('.ascii-box-wrapper').forEach(el => el.remove());
}
