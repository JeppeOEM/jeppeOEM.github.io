/**
 * Registry of background animations for js/P5Background.js.
 *
 * To add one: write js/animations/<name>.js exporting an animation object
 * (see the contract at the top of P5Background.js) and add it here. The key
 * is the name used by `?anim=<name>` and by `window.p5Background.run(name)`.
 */
import hexadecimal from "./hexadecimal.js";
import hitzo from "./hitzo.js";
import hitzoAnsi from "./hitzoAnsi.js";
import hitzoAnsiColor from "./hitzoAnsiColor.js";

// hexadecimal listed first: Object.keys() order is insertion order, and
// js/code.js falls back to the first key when no ?anim= or saved pick applies.
export const animations = {
  hexadecimal,
  hitzo,
  "hitzo-ansi": hitzoAnsi,
  "hitzo-ansi-color": hitzoAnsiColor,
};
