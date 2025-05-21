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
            verticalLines: 5,
            breakpoint: 480
        },
        tabletBreakpoint: {
            horizontalChars: 60,
            verticalLines: 20,
            breakpoint: 768
        },
        desktopBreakpoint: {
            horizontalChars: 80,
            verticalLines: 10
        },
        delay: 2800,
        duration: 3000

    })

    asciiBox.init()




    const topBorderLeft = document.querySelector('.borderTopLeft');
    charAnimation(topBorderLeft, 2, 1500, "══", 'var(--white)');
    const charTopLeft = document.querySelector('.charTopLeft');
    charAnimation(charTopLeft, 2, 1450, "::");
    const charSecondTopLeft = document.querySelector('.charSecondTopLeft');
    charAnimation(charSecondTopLeft, 2, 1400, "::");
    const centerDivLeft = document.querySelector('.centerDivLeft');
    charAnimation(centerDivLeft, 4, 1400, ":░", "var(--white)");
    const charSecondBottomLeft = document.querySelector('.charSecondBottomLeft');
    charAnimation(charSecondBottomLeft, 2, 1400, "::");
    const charBottomLeft = document.querySelector('.charBottomLeft');
    charAnimation(charBottomLeft, 2, 1450, "::");

    const bottomBorderLeft = document.querySelector('.bottomBorderLeft');
    charAnimation(bottomBorderLeft, 2, 1500, "══", "var(--white)");

    const topBorder = document.querySelector('.borderTop');
    charAnimation(topBorder, 4, 700, "══", "var(--white)");
    const charTop = document.querySelector('.charTop');
    charAnimation(charTop, 4, 650, "::");
    const charSecondTop = document.querySelector('.charSecondTop');
    charAnimation(charSecondTop, 4, 600, "::");
    const centerDiv = document.querySelector('.centerDiv');
    charAnimation(centerDiv, 8, 600, ":░", "var(--white)");
    const charSecondBottom = document.querySelector('.charSecondBottom');
    charAnimation(charSecondBottom, 4, 600, "::");
    const charBottom = document.querySelector('.charBottom');
    charAnimation(charBottom, 4, 650, "::");
    const bottomBorder = document.querySelector('.bottomBorder');
    charAnimation(bottomBorder, 4, 700, "══", "var(--white)");



}


