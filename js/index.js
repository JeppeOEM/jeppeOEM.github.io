import { run } from '/src/run.js'
import * as program from '/src/programs/contributed/slime_dish2.js'
import AsciiBox from "./AsciiBox.js"



document.addEventListener('DOMContentLoaded', () => {

  setTimeout(function() {
    run(program, { element: document.querySelector('.slime') })
      .then(function(e) {
        console.log(e);
      })
      .catch(function(e) {
        console.warn(e.message);
        console.log(e.error);
      });
  }, 2000); // 2000 milliseconds = 2 seconds



  const fontSelector = document.getElementById('font-selector');

  // Function to load font and apply it
  function applyFont(fontFamily) {
    // Update status message
    const statusElement = document.getElementById('font-status');
    if (statusElement) {
      statusElement.textContent = `Loading font: ${fontFamily}...`;
    }

    // Apply the font to the document body
    document.body.style.fontFamily = fontFamily;

    // Force a redraw of all content by temporarily modifying the body
    const originalBodyHTML = document.body.innerHTML;

    // Create a style tag to force the font on all elements
    const styleElement = document.createElement('style');
    styleElement.textContent = `
            * {
                font-family: ${fontFamily} !important;
            }
        `;
    document.head.appendChild(styleElement);

    // Force a redraw by briefly hiding everything
    document.body.style.visibility = 'hidden';

    // Use setTimeout to ensure the browser processes the visibility change
    setTimeout(() => {
      // Restore visibility to make content visible again with new font
      document.body.style.visibility = 'visible';

      // Remove the temporary style element after a short delay
      setTimeout(() => {
        document.head.removeChild(styleElement);
        // The font-family set on body will remain in effect
      }, 500);
    }, 50);

    // Use Font Loading API if available
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`14px ${fontFamily}`).then(() => {
        if (statusElement) {
          statusElement.textContent = `Font loaded: ${fontFamily}`;
          // Clear the message after a short time
          setTimeout(() => {
            statusElement.textContent = '';
          }, 2000);
        }

        // Apply to all text elements again after confirmed loading
        forceRedrawWithFont(fontFamily);
      }).catch(err => {
        console.log('Font loading error:', err);
        if (statusElement) {
          statusElement.textContent = `Note: Using fallback font if ${fontFamily} is unavailable`;
        }
      });
    } else {
      // Fallback for browsers that don't support Font Loading API
      setTimeout(() => {
        if (statusElement) {
          statusElement.textContent = '';
        }
        forceRedrawWithFont(fontFamily);
      }, 1000);
    }
  }

  // Helper function to force redraw with the new font
  function forceRedrawWithFont(fontFamily) {
    // Apply to specific elements that might need explicit setting
    const allTextElements = document.querySelectorAll('body *');
    allTextElements.forEach(el => {
      // Skip form elements that might need their own fonts
      if (el.tagName !== 'SELECT' && el.tagName !== 'OPTION' &&
        el.tagName !== 'BUTTON' && el.tagName !== 'INPUT') {
        el.style.fontFamily = fontFamily;
      }
    });

    // One more trick to force the browser to redraw everything
    const docElement = document.documentElement;
    const originalDisplay = docElement.style.display || '';
    docElement.style.display = 'none';
    void docElement.offsetHeight; // Trigger reflow
    docElement.style.display = originalDisplay;
  }

  // Add event listener for font changes
  if (fontSelector) {
    fontSelector.addEventListener('change', function() {
      const selectedFont = fontSelector.value;
      applyFont(selectedFont);
    });

    // Apply the default selected font on page load
    const initialFont = fontSelector.value;
    applyFont(initialFont);
  }


  const templateClosestChild = document.querySelector('.outer')
  const template = document.getElementById('outer-template')
  const asciiBox = new AsciiBox({
    templateClosestChild: templateClosestChild,
    template: template,
    mobileBreakpoint: {
      horizontalChars: 30,
      verticalLines: 6,
      breakpoint: 480
    },
    tabletBreakpoint: {
      horizontalChars: 50,
      verticalLines: 3,
      breakpoint: 768
    },
    desktopBreakpoint: {
      horizontalChars: 70,
      verticalLines: 0
    },
    delay: 0,
    duration: 0
  })

  asciiBox.init()


  const preElement = document.querySelector('.ascii-art');

  if (preElement) {

    // Get and parse the text content
    const textContent = preElement.textContent;
    const textLines = textContent.split('\n');
    const maxLineLength = Math.max(...textLines.map(line => line.length));

    // Prepare spans for each character
    let htmlContent = '';

  }


  //for (let i = 0; i < textLines.length; i++) {
  //    for (let j = 0; j < maxLineLength; j++) {
  //        const char = textLines[i][j] || ' ';
  //        htmlContent += `<span data-row="${i}" data-col="${j}">${char}</span>`;
  //    }
  //    htmlContent += '<br>';
  //}
  //preElement.innerHTML = htmlContent;


  // Animate column by column
  async function animateColumns() {
    for (let col = 0; col < maxLineLength; col++) {
      const columnColor = colors[col % colors.length];

      for (let row = 0; row < textLines.length; row++) {
        const charSpan = document.querySelector(`span[data-row="${row}"][data-col="${col}"]`);

        if (charSpan) {
          charSpan.style.color = columnColor;

          // Small delay for next char
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      }

      // Delay before next column
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  //animateColumns(); // Call it after setup

  // Existing ASCII art animation hook
  const art = document.querySelector('.ascii-art');
  const target = document.querySelector('.target-text');
  if (art && target) {
    art.addEventListener('animationstart', (e) => {
      if (e.animationName === 'moveBack') {
        target.classList.add('visible');
      }
    });
  }
});
//     console.log(e)
// }).catch(function(e) {
//     console.warn(e.message)
//     console.log(e.error)
// })






function charLine(target, char) {
  const div = document.querySelector(target);

  // Create a span to measure character width
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace';
  span.style.visibility = 'hidden';
  span.textContent = char;
  document.body.appendChild(span);

  const charWidth = span.offsetWidth;
  const screenWidth = window.innerWidth;
  const repeatCount = Math.floor(screenWidth / charWidth);

  div.textContent = char.repeat(repeatCount);

  document.body.removeChild(span);
}

charLine(".nav-dots", "*")

//const sign = ":"
//
//function fillWithDollars() {
//    const asciiLogo = document.getElementById("ascii-logo");
//    const asciiLines = asciiLogo.innerText.trim().split("\n").length;
//
//    // Create a measurement span to calculate the exact width of a dollar sign
//    function getCharWidth(container) {
//        // Create temporary span to measure dollar sign width in the same font as container
//        const span = document.createElement("span");
//        span.style.visibility = "hidden"; // Make it invisible
//        span.style.position = "absolute"; // Remove from flow
//        span.style.whiteSpace = "nowrap"; // Prevent wrapping
//
//        // Copy the font properties from the container
//        const containerStyle = window.getComputedStyle(container);
//        console.log(containerStyle)
//        span.style.font = containerStyle.font;
//        span.style.fontSize = containerStyle.fontSize;
//        span.style.fontFamily = containerStyle.fontFamily;
//
//        // Add the dollar sign to measure
//        span.textContent = sign;
//
//        // Add to document to measure
//        document.body.appendChild(span);
//        const width = span.getBoundingClientRect().width;
//        document.body.removeChild(span);
//
//        return width;
//    }
//
//    function updateDollarFill() {
//        // Get the containers
//        const leftBox = document.querySelector(".left-box");
//        const rightBox = document.querySelector(".right-box");
//
//        // Calculate how many dollar signs fit per line based on container width and exact character width
//        const leftCharWidth = getCharWidth(leftBox);
//        const rightCharWidth = getCharWidth(rightBox);
//
//        // Calculate max number of $ that fit in each container
//        const leftWidth = Math.floor(leftBox.clientWidth / leftCharWidth);
//        const rightWidth = Math.floor(rightBox.clientWidth / rightCharWidth);
//
//        // Create dollar blocks that fit the current container sizes
//        const leftDollarLine = sign.repeat(Math.max(1, leftWidth));
//        const rightDollarLine = sign.repeat(Math.max(1, rightWidth));
//
//        // Generate the full content with same number of lines as the ASCII logo
//        const leftDollarBlock = Array(asciiLines).fill(leftDollarLine).join("\n");
//        const rightDollarBlock = Array(asciiLines).fill(rightDollarLine).join("\n");
//
//        // Update the content
//        leftBox.innerText = leftDollarBlock;
//        rightBox.innerText = rightDollarBlock;
//    }
//
//    // Initial fill
//    updateDollarFill();

// Update when window is resized
//    window.addEventListener("resize", updateDollarFill);
//}
//
//window.addEventListener("load", fillWithDollars);








