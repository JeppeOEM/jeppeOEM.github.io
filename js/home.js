
import { run } from '/src/run.js'
import * as program from '/src/programs/contributed/slime_dish2.js'
import AsciiBox from "./AsciiBox.js"


export function home() {
    const templateClosestChild = document.querySelector('.outer');
    const template = document.getElementById('outer-template');
    const asciiBox = new AsciiBox({
        templateClosestChild: templateClosestChild,
        template: template,
        mobileBreakpoint: {
            horizontalChars: 35,
            verticalLines: 8,
            breakpoint: 514
        },
        tabletBreakpoint: {
            horizontalChars: 35,
            verticalLines: 8,
            breakpoint: 515
        },
        desktopBreakpoint: {
            horizontalChars: 70,
            verticalLines: 2
        },
        delay: 7500,
        duration: 1500,
        styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 8000ms; /* 4 second delay */
}

`
    });


    asciiBox.init();

    //const preElement = document.querySelector('.ascii-art');
    //if (preElement) {
    //    const textContent = preElement.textContent;
    //    const textLines = textContent.split('\n');
    //    const maxLineLength = Math.max(...textLines.map(line => line.length));
    //    let htmlContent = ''; // You might want to use this for future character formatting
    //}
    //
    //const art = document.querySelector('.ascii-art');
    //const target = document.querySelector('.target-text');
    //if (art && target) {
    //    art.addEventListener('animationstart', (e) => {
    //        if (e.animationName === 'moveBack') {
    //            target.classList.add('visible');
    //        }
    //    });
    //}

    setTimeout(function() {
        run(program, { element: document.querySelector('.slime') })
            .then(function(e) {
                console.log(e);
            })
            .catch(function(e) {
                console.warn(e.message);
                console.log(e.error);
            });
    }, 2000);

}
