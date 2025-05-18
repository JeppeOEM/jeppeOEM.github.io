import { run } from '/src/run.js'
import * as program from '/src/programs/contributed/slime_dish2.js'
import AsciiBox from "./AsciiBox.js"

document.addEventListener('DOMContentLoaded', () => {
  const selectedFont = localStorage.getItem('selectedFont') || 'PetMe';
  const fontData = localStorage.getItem(`fontBase64_${selectedFont}`);

  if (fontData) {
    const font = new FontFace(selectedFont, `url(${fontData})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      document.body.style.setProperty('font-family', `${selectedFont}, monospace`, 'important');
      fontDependentCode();
    }).catch((error) => {
      console.error('Font failed to load:', error);
      fallbackToDefault();
    });
  } else {
    document.body.style.setProperty('font-family', `${selectedFont}, monospace`, 'important');
    fontDependentCode();
  }
});

function fallbackToDefault() {
  document.body.style.setProperty('font-family', 'monospace', 'important');
  fontDependentCode();
}

//  This function saves selected font and reloads it
export function saveFontSelectionAndReloadFont(fontName) {
  localStorage.setItem('selectedFont', fontName);
  const fontData = localStorage.getItem(`fontBase64_${fontName}`);

  if (fontData) {
    const font = new FontFace(fontName, `url(${fontData})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      document.body.style.setProperty('font-family', `${fontName}, monospace`, 'important');
      //fontDependentCode();
    }).catch((error) => {
      console.error('Failed to load selected font:', error);
      fallbackToDefault();
    });
  } else {
    document.body.style.setProperty('font-family', `${fontName}, monospace`, 'important');
    //fontDependentCode();
  }
}

function fontDependentCode() {
  const templateClosestChild = document.querySelector('.outer');
  const template = document.getElementById('outer-template');
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
  });

  asciiBox.init();

  const preElement = document.querySelector('.ascii-art');
  if (preElement) {
    const textContent = preElement.textContent;
    const textLines = textContent.split('\n');
    const maxLineLength = Math.max(...textLines.map(line => line.length));
    let htmlContent = ''; // You might want to use this for future character formatting
  }

  const art = document.querySelector('.ascii-art');
  const target = document.querySelector('.target-text');
  if (art && target) {
    art.addEventListener('animationstart', (e) => {
      if (e.animationName === 'moveBack') {
        target.classList.add('visible');
      }
    });
  }

  setTimeout(function() {
    run(program, { element: document.querySelector('.slime') })
      .then(function(e) {
        console.log(e);
      })
      .catch(function(e) {
        console.warn(e.message);
        console.log(e.error);
      });
  }, 2000);

  function charLine(target, char) {
    const div = document.querySelector(target);
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

  charLine(".nav-dots", "*");
}
