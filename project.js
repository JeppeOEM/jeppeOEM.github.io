import { animate, scroll, timeline, spring, stagger, inView } from "https://cdn.skypack.dev/motion";

let body = document.querySelector("body");
let nav = document.querySelector("nav");

animate(body, {opacity: 1}, {duration:2});
animate(nav, {opacity: 1}, {duration:2});