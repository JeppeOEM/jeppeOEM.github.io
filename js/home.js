import { run } from "/src/run.js";
import * as program from "/src/programs/contributed/slime_dish2.js";
import AsciiBox from "./AsciiBox.js";

export function home() {
  const mobileBreakpoint = {
    horizontalChars: 35,
    verticalLines: 9,
    breakpoint: 545,
  };
  const tabletBreakpoint = {
    horizontalChars: 35,
    verticalLines: 9,
    breakpoint: 546,
  };
  const desktopBreakpoint = {
    horizontalChars: 70,
    verticalLines: 5,
  };

  const templateClosestChild = document.querySelector(".outer");
  const template = document.getElementById("outer-template");

  const asciiBox = new AsciiBox({
    templateClosestChild: templateClosestChild,
    template: template,
    mobileBreakpoint: mobileBreakpoint,
    tabletBreakpoint: tabletBreakpoint,
    desktopBreakpoint: desktopBreakpoint,
    delay: 5500,
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

  // Start the slime background.
  function initializeAnimation() {
    const viewportWidth = document.documentElement.clientWidth;
    const isMobileOrTablet = viewportWidth < tabletBreakpoint.breakpoint;
    const preElement = document.querySelector(".slime");
    const canvasElement = document.querySelector(".slime-canvas");
    const pageBackgroundColor = getComputedStyle(document.body).backgroundColor;
    const slimeLetterColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--dark-green")
        .trim() || "#39ff14";
    const textSettings = { element: preElement };
    const canvasSettings = {
      renderer: "canvas",
      element: canvasElement,
      backgroundColor: pageBackgroundColor,
    };

    // Startup-only renderer switch: canvas on mobile/tablet, text on desktop.
    const shouldUseCanvas = Boolean(isMobileOrTablet && canvasElement);
    if (preElement) preElement.hidden = shouldUseCanvas;
    if (canvasElement) canvasElement.hidden = !shouldUseCanvas;

    const selectedSettings = shouldUseCanvas ? canvasSettings : textSettings;
    const selectedProgram = shouldUseCanvas
      ? {
          ...program,
          settings: {
            ...program.settings,
            color: slimeLetterColor,
          },
        }
      : program;

    run(selectedProgram, selectedSettings).catch((e) => {
      // canvas failed: fall back to the text renderer
      if (shouldUseCanvas && preElement) {
        preElement.hidden = false;
        if (canvasElement) canvasElement.hidden = true;
        run(program, textSettings).catch((textError) => {
          console.warn("Animation warning: " + textError.message);
          console.log(textError.error);
        });
        return;
      }
      console.warn("Animation warning: " + e.message);
      console.log(e.error);
    });
  }

  // Start 500ms after the browser first goes idle (waiting at most 2s), so the
  // animation doesn't compete with the first paint.
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => setTimeout(initializeAnimation, 500), { timeout: 2000 });
  } else {
    setTimeout(initializeAnimation, 500);
  }
}
