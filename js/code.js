import BinaryStreamSections from "./BinaryStreamSections.js";
import P5Background from "./P5Background.js";
import { animations } from "./animations/index.js";

export function codePage() {
  // p5 canvas behind the page. Which animation runs: ?anim=<name> in the URL,
  // else the last pick from the bottom bar, else the first registered one.
  const names = Object.keys(animations);
  const wanted = new URLSearchParams(location.search).get("anim");
  let saved = null;
  try {
    saved = localStorage.getItem("selectedBackground");
  } catch (e) {}
  const initial = [wanted, saved].find((n) => n && animations[n]) || names[0];

  const bodyBackground = new P5Background({
    animations,
    initial,
    container: document.body,
    colors: {
      base: "var(--dark-green)",
      highlight: "var(--light-green)",
    },
    zIndex: -1,
    frameRate: 30,
    // nothing is drawn behind these elements
    exclude: [".text-box"],
    excludePadding: 1,
  });
  bodyBackground.init();
  // console: p5Background.list(), p5Background.run("hexRain"), p5Background.next()
  window.p5Background = bodyBackground;

  // bottom bar: one option per registered animation, remembered like the font
  const selector = document.getElementById("background-selector");
  if (selector) {
    for (const name of names) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      selector.appendChild(option);
    }
    selector.value = initial;
    selector.addEventListener("change", (e) => {
      const name = e.target.value;
      bodyBackground.run(name);
      try {
        localStorage.setItem("selectedBackground", name);
      } catch (e2) {}
    });
  }

  // 0/1 rows beside the logo tick left as one stream passing under it
  const binaryStream = new BinaryStreamSections({
    sections: [
      document.getElementById("leftSection"),
      document.getElementById("rightSection"),
    ],
    // the 0/1 inside the logo show the same stream at their own columns
    logo: document.querySelector(".center-pre"),
    logoZeroClass: "code-logo-color-2",
    logoOneClass: "code-logo-color-5",
    stepMs: 450,
    streamRows: 3,
    blankLines: 4,
  });
  binaryStream.init();
  window.binaryStream = binaryStream;
}
