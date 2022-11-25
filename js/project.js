import { animate } from "https://cdn.skypack.dev/motion";

let body = document.querySelector("body");
let nav = document.querySelector("nav");

animate(body, { opacity: 1 }, { duration: 2 });
animate(nav, { opacity: 1 }, { duration: 2 });

document.addEventListener("DOMContentLoaded", start);

function start() {
  const toggleLi = document.querySelector(".flex-column"); // Using a class instead, see note below.
  const toggleHeight = document.querySelector("#navbar");

  const link_list = document.querySelectorAll(".list_link");
  const menu = document.querySelector(".mobile_menu");

  menu.addEventListener("click", () => {
    toggleLi.classList.toggle("hide");
    toggleHeight.classList.toggle("toggleHeight");
    link_list.forEach((ele) => {
      ele.classList.toggle("hide");
    });
  });
}
