import { run } from '/src/run.js'
import * as program from '/src/programs/contributed/slime_dish2.js'
import AsciiBox from "./AsciiBox.js"


export function loadPage(fontDependentCode) {



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

  function fallbackToDefault() {
    document.body.style.setProperty('font-family', 'monospace', 'important');
    fontDependentCode();
  }
}



