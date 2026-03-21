export function charLine(target, char) {
  const div = document.querySelector(target);
  const span = document.createElement("span");
  span.style.fontFamily = "monospace";
  span.style.visibility = "hidden";
  span.textContent = char;
  document.body.appendChild(span);

  const charWidth = span.offsetWidth;
  const screenWidth = window.innerWidth;
  const repeatCount = Math.floor(screenWidth / charWidth);

  div.textContent = char.repeat(repeatCount);
  document.body.removeChild(span);
}
