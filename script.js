import { animate, scroll, timeline, spring, stagger, inView } from "https://cdn.skypack.dev/motion";




inView("section", ({ target }) => {
  animate(
    target.querySelector("h3"),
    { opacity: 1, transform: "none" },
    { delay: 0.2, duration: 0.9, easing: [0.17, 0.55, 0.55, 1] }
  );
});


// Progress bar representing gallery scroll
scroll(animate(".progress", { scaleX: [0, 1] }));

document.querySelectorAll(".snap").forEach((section) => {
  console.log(section);
  const header = section.querySelector("h3");
  scroll(animate(header, { y: [-400, 400] }), {
    target: header
  });
});



inView(".logos",staggerImg)
function staggerImg(){

 animate(".logos img",{transform: ["translateX(2000px)", "none"]},  {  delay: stagger(0.5, {easing: "linear"}) } ); 
}

/* 
document.addEventListener('DOMContentLoaded', init) */


/* function init(){
  let words = document.querySelectorAll('span');
  let counter = 0;

  function loop() {
    if (counter === 5){
      words.forEach(word => {
        var interv = 'undefined'
        var canChange = false
        var globalCount = 0
        var count = 0
        var INITIAL_WORD = word.textContent;
        console.log(INITIAL_WORD);
        var isGoing = false
        var interv = 'undefined'
        init()
      
        function init() {
          if(isGoing) return;
          
          isGoing = true
          var randomWord = getRandomWord(word)
          word.innerHTML = randomWord
          
          interv = setInterval(function() {
          var finalWord = ''
          for(var x=0;x<INITIAL_WORD.length;x++) {
           if(x <= count && canChange) {
            finalWord += INITIAL_WORD[x]
           } else {
            finalWord += getRandomLetter()
           }
          }
          word.textContent = finalWord
          if(canChange) {
            count++
          }
          if(globalCount >= 2) {
           canChange = true
          }
          if(count>=INITIAL_WORD.length) {
           clearInterval(interv)
           count = 0
           canChange = false
           globalCount = 0
           isGoing = false
          }
          globalCount++
          },10)
          
          }
      
      })
      
    }

    if (counter < 6) {
      counter++;
      setTimeout(loop, 1000);
    console.log("sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
    }
  }

 loop();
  
    
  


} */


const element = document.querySelectorAll("h3");


//https://www.youtube.com/watch?v=Dxm6EwvQIl8&ab_channel=DesignCourse

window.addEventListener('scroll', function(e) {

    const target = document.querySelectorAll('.scroll');


    var index = 0, length = target.length;
    for (index; index < length; index++) {
        var pos = window.pageYOffset * target[index].dataset.rate;

        if(target[index].dataset.direction === 'vertical') {
            target[index].style.transform = 'translate3d(0px,'+pos+'px, 0px)';
        } else {
            var posX = window.pageYOffset * target[index].dataset.ratex;
            var posY = window.pageYOffset * target[index].dataset.ratey;
            
            target[index].style.transform = 'translate3d('+posX+'px, '+posY+'px, 0px)';
        }
    }


});

//end of copied code





function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomLetter() {
var alphabet = ['ᕤ ','ˇ','ó','ツ','1','0','x','$','@',')','(','[',']','1','0','1','0','1','*','¤','x','z','x','y','#']
return alphabet[rand(0,alphabet.length - 1)]
}
function getRandomWord(word) {
var text = word.innerHTML

var finalWord = ''
for(var i=0;i<text.length;i++) {
  finalWord += text[i] == ' ' ? ' ' : getRandomLetter()
}

return finalWord
}










/* 
var interv = 'undefined'
var canChange = false
var globalCount = 0
var count = 0

var isGoing = false

document.querySelectorAll("span").forEach((button) => button.addEventListener("mouseover", shuffleWord));

let texxt = document.querySelector('p');
console.log(texxt);
   

function shuffleWord(event){
   let INITIAL_WORD = event.target.innerHTML;
    if(isGoing) return;
    var randomWord = getRandomWord(INITIAL_WORD);
      event.target.innerHTML = randomWord;
      isGoing = true;
    interv = setInterval(function() {
     var finalWord = ''
     for(var x=0;x<INITIAL_WORD.length;x++) {
      if(x <= count && canChange) {
       finalWord += INITIAL_WORD[x]
      } else {
       finalWord += getRandomLetter()
      }
     }
     event.target.innerHTML = finalWord
     if(canChange) {
       count++
     }
     if(globalCount >= 20) {
      canChange = true
     }
     if(count>=INITIAL_WORD.length) {
      clearInterval(interv)
      count = 0
      canChange = false
      globalCount = 0
      isGoing = false
     }
     globalCount++
    },1)


    function getRandomLetter() {
        var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        return alphabet[rand(0,alphabet.length - 1)]
       }
    

    function getRandomWord(word) {
        var text = word;
        console.log(text);
        INITIAL_WORD = event.target.innerText;
        
        var finalWord = ''
        for(var i=0;i<text.length;i++) {
          finalWord += text[i] == ' ' ? ' ' : getRandomLetter()
        }
       
        return finalWord
      }
   

      function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


} */


const button = document.querySelector(".dark");

// MediaQueryList object
const useDark = window.matchMedia("(prefers-color-scheme: dark)");

// Toggles the "dark-mode" class based on if the media query matches
function toggleDarkMode(state) {
  // Older browser don't support the second parameter in the
  // classList.toggle method so you'd need to handle this manually
  // if you need to support older browsers.
  document.documentElement.classList.toggle("dark-mode", state);
}

// Initial setting
toggleDarkMode(useDark.matches);

// Listen for changes in the OS settings
useDark.addListener((evt) => toggleDarkMode(evt.matches));

// Toggles the "dark-mode" class on click
button.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
});


/* SLIDER */
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
} 



var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-170px";
  }
  prevScrollpos = currentScrollPos;
}


const ascii_link = document.querySelector(".ascii_link");
ascii_link.addEventListener("click", ()=>{

  alert("SDSDsds")

});



/* SLIDES */

