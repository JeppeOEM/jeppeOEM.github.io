export default class FontLoader {
    constructor(callback, options = {}) {
        this.callback = callback;
        this.defaultFont = options.defaultFont || 'PetMe';
        this.fallbackFont = options.fallbackFont || 'monospace';
        this.fontSize = localStorage.getItem('fontSize') || options.defaultFontSize || '16px';
    }

    load() {
        document.addEventListener('DOMContentLoaded', () => {
            const selectedFont = localStorage.getItem('selectedFont') || this.defaultFont;
            const fontData = localStorage.getItem(`fontBase64_${selectedFont}`);

            if (fontData) {
                const font = new FontFace(selectedFont, `url(${fontData})`);
                font.load().then((loadedFont) => {
                    document.fonts.add(loadedFont);
                    this.applyFontStyles(selectedFont);
                    this.callback(); // font-dependent logic
                }).catch((error) => {
                    console.error('Font failed to load:', error);
                    this.fallback();
                });
            } else {
                this.applyFontStyles(selectedFont);
                this.callback(); // no custom font, still run logic
            }
        });
    }

    applyFontStyles(fontFamily) {
        document.body.style.setProperty('font-family', `${fontFamily}, ${this.fallbackFont}`, 'important');
        document.body.style.setProperty('font-size', this.fontSize, 'important');
    }

    fallback() {
        this.applyFontStyles(this.fallbackFont);
        this.callback();
    }

    static saveFontSelection(fontName, fontSize = '16px') {
        localStorage.setItem('selectedFont', fontName);
        localStorage.setItem('fontSize', fontSize);
    }
}
