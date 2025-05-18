export function saveFontSelection(fontName) {
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

