import { applyFont, getSavedFont } from "./font.js";

// Apply the saved font, start the page, and reveal the body (hidden by
// css/base.css) once the font is ready.
export function loadPage(startPage) {
  applyFont(getSavedFont());
  startPage();
  document.fonts.ready.then(() => document.body.classList.add("loaded"));
}
