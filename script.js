import { animate, scroll, timeline, spring, stagger, inView } from "https://cdn.skypack.dev/motion";




//https://www.youtube.com/watch?v=Dxm6EwvQIl8&ab_channel=DesignCourse

window.addEventListener('scroll', function(e) {
    console.log("hej");
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





function word_effect(word, speed){


var interv = 'undefined'
var canChange = false
var globalCount = 0
var count = 0
var INITIAL_WORD = word.textContent;
var isGoing = false

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomLetter() {
var alphabet = ['a','s','c','i','i','a','r','t','h','t','t','p','s','p','l','a','y','.','e','r','t','d','f','x','y','z']
return alphabet[rand(0,alphabet.length - 1)]
}
function getRandomWord(word) {
var text = word.textContent;

var finalWord = ''
for(var i=0;i<text.length;i++) {
  finalWord += text[i] == ' ' ? ' ' : getRandomLetter()
}

return finalWord
}

function init(word, speed) {
if(isGoing) return;

isGoing = true
var randomWord = getRandomWord(word)
word.textContent = randomWord


interv = setInterval(function() {
var finalWord = ''
for(var x=0;x<INITIAL_WORD.length;x++) {
 if(x <= count && canChange) {
  finalWord += INITIAL_WORD[x]
 } else {
  finalWord += getRandomLetter()
 }
}
word.innerHTML = finalWord
if(canChange) {
  count++
}
if(globalCount >= 10) {
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
},speed)

}

init(word, speed)


}


animate(".jeppe", { opacity: 1 }, { duration: 2 })
delay();

function delay(){
var creative = document.querySelector('.creative');
var word = document.querySelector('.ascii_art');
var word2 = document.querySelector('.the_link');
var link = document.querySelector('.ascii_link');
setTimeout(introText, 500);
setTimeout(credits, 3000);

function credits() {
link.classList.remove('hide');
word_effect(word, 20);
word_effect(word2, 20);
}

function introText() {
  creative.classList.remove('hide');
  word_effect(creative, 20);
}

}











/* SLIDES */




