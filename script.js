import { animate, scroll, timeline, spring, stagger, inView } from "https://cdn.skypack.dev/motion";

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

/* menu.addEventListener("click", () => {
 
}); */

link_list.forEach((ele) => {
  ele.addEventListener("click", () => {
    toggleLi.classList.toggle("hide");
    toggleHeight.classList.toggle("toggleHeight");
    link_list.forEach((ele) => {
      ele.classList.toggle("hide");
    });
  });
});

window.addEventListener("scroll", (event) => {
  let pos = window.pageYOffset;
  if (pos < 1) {
    delay();
  }
});

window.addEventListener("DOMContentLoaded", (event) => {
  let nav = document.querySelector("nav");
  let pos = window.pageYOffset;
  if (pos < 1) {
    delay();
  }

  setTimeout(() => {
    animate("nav", { opacity: 0.9 }, { duration: 1 });
    animate(".jeppe span", {}, { delay: stagger(0.5) });
  }, 3500);
});

var isGoing = false;
var canChange = false;
var globalCount = 0;
var count = 0;
function word_effect(word, speed) {
  var interv = "undefined";

  var INITIAL_WORD = word.textContent;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function getRandomLetter() {
    var alphabet = ["a", "s", "c", "i", "i", "a", "r", "t", "h", "t", "t", "p", "s", "p", "l", "a", "y", ".", "e", "r", "t", "d", "f", "x", "y", "z"];
    return alphabet[rand(0, alphabet.length - 1)];
  }
  function getRandomWord(word) {
    var text = word.textContent;

    var finalWord = "";
    for (var i = 0; i < text.length; i++) {
      finalWord += text[i] == " " ? " " : getRandomLetter();
    }

    return finalWord;
  }

  function init(word, speed) {
    if (isGoing) return;

    isGoing = true;
    var randomWord = getRandomWord(word);
    word.textContent = randomWord;

    interv = setInterval(function () {
      var finalWord = "";
      for (var x = 0; x < INITIAL_WORD.length; x++) {
        if (x <= count && canChange) {
          finalWord += INITIAL_WORD[x];
        } else {
          finalWord += getRandomLetter();
        }
      }
      word.innerHTML = finalWord;
      if (canChange) {
        count++;
      }
      if (globalCount >= 10) {
        canChange = true;
      }
      if (count >= INITIAL_WORD.length) {
        clearInterval(interv);
        count = 0;
        canChange = false;
        globalCount = 0;
        isGoing = false;
      }
      globalCount++;
    }, speed);
  }

  init(word, speed);
}

function delay() {
  var creative = document.querySelector(".creative");
  var word = document.querySelector(".ascii_art");
  var word2 = document.querySelector(".the_link");
  var link = document.querySelector(".ascii_link");
  setTimeout(() => {
    animate(".jeppe", { opacity: 1 }, { duration: 2 });
  }, 1500);
  setTimeout(introText, 2000);
  setTimeout(credits, 5000);
  setTimeout(credits2, 6000);

  function credits() {
    animate(".ascii_link", { opacity: 1 }, { duration: 1 });
    word_effect(word, 10);
  }

  function credits2() {
    word2.classList.remove("display");
    animate(".the_link", { opacity: 1 }, { duration: 2 });
    word_effect(word2, 10);
  }

  function introText() {
    animate(".creative", { opacity: 1 }, { duration: 2 });
    word_effect(creative, 20);
  }
}

//https://www.youtube.com/watch?v=Dxm6EwvQIl8&ab_channel=DesignCourse

window.addEventListener("scroll", () => {
  const target = document.querySelectorAll(".scroll");
  let index = 0,
    length = target.length;
  for (index; index < length; index++) {
    let pos = window.pageYOffset * target[index].dataset.rate;

    if (target[index].dataset.direction === "vertical") {
      target[index].style.transform = "translate3d(0px," + pos + "px, 0px)";
    } else {
      let posX = window.pageYOffset * target[index].dataset.ratex;
      let posY = window.pageYOffset * target[index].dataset.ratey;
      target[index].style.transform = "translate3d(" + posX + "px, " + posY + "px, 0px)";
    }
  }
});

/* Obfuscation */

function decode(a) {
  return a.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
}
function openMailer(element) {
  var y = decode("znvygb:orahgmre@qbznva.qr");
  element.setAttribute("href", y);
  element.setAttribute("onclick", "");
}
