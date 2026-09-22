/**
 * Registry of background animations for js/P5Background.js.
 *
 * To add one: write js/animations/<name>.js exporting an animation object
 * (see the contract at the top of P5Background.js) and add it here. The key
 * is the name used by `?anim=<name>` and by `window.p5Background.run(name)`.
 */
import asciiScramble from "./asciiScramble.js";
import hexRain from "./hexRain.js";
import flowField from "./flowField.js";

export const animations = {
  asciiScramble,
  hexRain,
  flowField,
};
