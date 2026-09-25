// The site-wide font choice, stored in localStorage. The families come from
// css/font.css; each page's inline <head> script applies the saved one before
// first paint, and these helpers keep it applied and saved afterwards.

export const DEFAULT_FONT = "IBMVGA8";

export function getSavedFont() {
  try {
    return localStorage.getItem("selectedFont") || DEFAULT_FONT;
  } catch (e) {
    return DEFAULT_FONT;
  }
}

export function applyFont(name) {
  document.body.style.setProperty("font-family", `${name}, monospace`, "important");
}

export function saveFont(name) {
  try {
    localStorage.setItem("selectedFont", name);
  } catch (e) {}
  applyFont(name);
}
