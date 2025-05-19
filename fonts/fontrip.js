const fs = require('fs');
const path = require('path');

// Directory with your .ttf fonts
const fontDir = path.join(__dirname);

// Output file (editable later)
const outputFile = path.join(__dirname, 'fonts.css.txt');

// Utility to clean the font name from filename
function cleanFontName(fileName) {
  return fileName
    .replace('.ttf', '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate CSS @font-face rules
function generateFontFaceCSS() {
  const files = fs.readdirSync(fontDir);
  let cssOutput = '';

  files.forEach(file => {
    if (path.extname(file).toLowerCase() !== '.ttf') return;

    const fontFamily = cleanFontName(file);

    cssOutput += `@font-face {\n`;
    cssOutput += `  font-family: '${fontFamily}';\n`;
    cssOutput += `  src: url('./fonts/${file}') format('truetype');\n`;
    cssOutput += `  font-display: swap;\n`;
    cssOutput += `}\n\n`;
  });

  fs.writeFileSync(outputFile, cssOutput);
  console.log(`✅ Saved to: ${outputFile}`);
}

generateFontFaceCSS();