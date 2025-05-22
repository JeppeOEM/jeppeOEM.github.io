import AsciiBox from "./AsciiBox.js";
import AsciiLogoBackground from "./AsciiLogoBackground.js";
import AsciiBackground from "./AsciiBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";
import { dotPattern } from "./dotPattern.js"
import { charAnimation } from "./charAnimation.js";



export function linksPage() {

    // const bodyBackground = new AsciiBackground({
    //     asciiArt: dotPattern,
    //     container: document.body,
    //     style: {
    //         color: 'var(--blue)',
    //         opacity: 1,
    //         zIndex: -1
    //     }
    // });

    // if (bodyBackground) {
    //     const background = document.querySelector(".ascii-background")
    //     background.classList.add("fade-in-bg")
    // }


    // const leftSection = document.getElementById('leftSection');
    // const rightSection = document.getElementById('rightSection');
    // const logoPre = document.querySelector('.center-pre')
    // console.log(leftSection, rightSection)
    // const logoBackground = new AsciiLogoBackground({
    //     leftSection: leftSection,
    //     rightSection: rightSection,
    //     leftPre: leftPre,
    //     rightPre: rightPre,
    //     logoPre: logoPre
    // })

    // logoBackground.fillSections()
    // logoBackground.init()



    const templateClosestChild = document.querySelector('.outer')
    const template = document.getElementById('outer-template')
    const asciiBox = new AsciiBox({
        templateClosestChild: templateClosestChild,
        template: template,
        mobileBreakpoint: {
            horizontalChars: 42,
            verticalLines: 10,
            verticalHeaderLines: 8,
            breakpoint: 480
        },
        tabletBreakpoint: {
            horizontalChars: 60,
            verticalLines: 20,
            verticalHeaderLines: 0,
            breakpoint: 768
        },
        desktopBreakpoint: {
            horizontalChars: 80,
            verticalHeaderLines: 0,
            verticalLines: 10
        },
    styleTextContent: `.fade-in-box {
    opacity: 0;
    transform: translateY(200%) scale(0.5);
    animation: fadeSlideScale 1500ms ease forwards;
    animation-delay: 2000ms;
}
    .fade-in-box.show {
        /* Triggers the animation */
    }

    @keyframes fadeSlideScale {
        0% {
            opacity: 0;
            transform: translateY(200%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(0%) scale(0.5); /* Finished sliding, no scale yet */
        }
        100% {
            opacity: 1;
            transform: translateY(0%) scale(1); /* Scale up in place */
        }
    }
`
  })

  asciiBox.init()

    const topBorderLeft = document.querySelector('.borderTopLeft');
    charAnimation(topBorderLeft, 2, 700, "═══", 'var(--white)');
    const charTopLeft = document.querySelector('.charTopLeft');
    charAnimation(charTopLeft, 2, 650, ":::");
    const charSecondTopLeft = document.querySelector('.charSecondTopLeft');
    charAnimation(charSecondTopLeft, 2, 600, ":::");
    const centerDivLeft = document.querySelector('.centerDivLeft');
    charAnimation(centerDivLeft, 4, 600, ":░", "var(--white)");
    const charSecondBottomLeft = document.querySelector('.charSecondBottomLeft');
    charAnimation(charSecondBottomLeft, 2, 600, ":::");
    const charBottomLeft = document.querySelector('.charBottomLeft');
    charAnimation(charBottomLeft, 2, 650, ":::");
    const bottomBorderLeft = document.querySelector('.bottomBorderLeft');
    charAnimation(bottomBorderLeft, 2, 700, "═══", "var(--white)");

    const topBorder = document.querySelector('.borderTop');
    charAnimation(topBorder, 2, 700, "═══", "var(--white)");
    const charTop = document.querySelector('.charTop');
    charAnimation(charTop, 2, 650, ":::");
    const charSecondTop = document.querySelector('.charSecondTop');
    charAnimation(charSecondTop, 2, 600, ":::");
    const centerDiv = document.querySelector('.centerDiv');
    charAnimation(centerDiv, 4, 600, ":░", "var(--white)");
    const charSecondBottom = document.querySelector('.charSecondBottom');
    charAnimation(charSecondBottom, 2, 600, ":::");
    const charBottom = document.querySelector('.charBottom');
    charAnimation(charBottom, 2, 650, ":::");
    const bottomBorder = document.querySelector('.bottomBorder');
    charAnimation(bottomBorder, 2, 700, "═══", "var(--white)");



}


