/**
 * Font Loading Module
 * Handles loading custom fonts from localStorage cache
 * 
 * Note: Heavy animation imports were removed from this file as they were unused.
 * Those modules are now preloaded via js/preloader.js for better performance.
 */

export function loadPage(fontDependentCode) {
  const selectedFont = localStorage.getItem("selectedFont") || "IBMVGA8";
  const fontData = localStorage.getItem(`fontBase64_${selectedFont}`);

  if (fontData) {
    const font = new FontFace(selectedFont, `url(${fontData})`);
    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        document.body.style.setProperty(
          "font-family",
          `${selectedFont}, monospace`,
          "important"
        );
        fontDependentCode();
      })
      .catch((error) => {
        console.error("Font failed to load:", error);
        fallbackToDefault();
      });
  } else {
    document.body.style.setProperty(
      "font-family",
      `${selectedFont}, monospace`,
      "important"
    );
    fontDependentCode();
  }

  function fallbackToDefault() {
    document.body.style.setProperty("font-family", "monospace", "important");
    fontDependentCode();
  }
}
