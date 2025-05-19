const fs = require('fs');

// Output file in current folder
const outputFile = 'fonts.css.txt';

// Function to clean font-family name
function cleanFontName(fileName) {
  return fileName
    .replace('.ttf', '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate @font-face rules for all .ttf files in this folder
function generateFontFaceCSS() {
  const files = fs.readdirSync('.');
  let cssOutput = '';

  files.forEach(file => {
    if (!file.toLowerCase().endsWith('.ttf')) return;

    const fontFamily = cleanFontName(file);

    cssOutput += `@font-face {\n`;
    cssOutput += `  font-family: '${fontFamily}';\n`;
    cssOutput += `  src: url('./${file}') format('truetype');\n`;
    cssOutput += `  font-display: swap;\n`;
    cssOutput += `}\n\n`;
  });

  fs.writeFileSync(outputFile, cssOutput);
  console.log(`✅ Saved to: ${outputFile}`);
}

generateFontFaceCSS();
