import AsciiBox from "./AsciiBox.js";
import AsciiLogoBackground from "./AsciiLogoBackground.js";
import AsciiBackground from "./AsciiBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";
import { dotPattern } from "./dotPattern.js"
import { horizontalBinaryAnimation, charAnimation } from "./charAnimation.js";



export function linksPage() {

    const bodyBackground = new AsciiBackground({
        asciiArt: dotPattern,
        container: document.body,
        style: {
            color: 'var(--blue)',
            opacity: 1,
            zIndex: -1
        }
    });

    if (bodyBackground) {
        const background = document.querySelector(".ascii-background")
        background.classList.add("fade-in-bg")
    }


    const leftSection = document.getElementById('leftSection');
    const rightSection = document.getElementById('rightSection');
    const logoPre = document.querySelector('.center-pre')
    console.log(leftSection, rightSection)
    const logoBackground = new AsciiLogoBackground({
        leftSection: leftSection,
        rightSection: rightSection,
        leftPre: leftPre,
        rightPre: rightPre,
        logoPre: logoPre
    })

    logoBackground.fillSections()
    logoBackground.init()



    const templateClosestChild = document.querySelector('.outer')
    const template = document.getElementById('outer-template')
    const asciiBox = new AsciiBox({
        templateClosestChild: templateClosestChild,
        template: template,
        mobileBreakpoint: {
            horizontalChars: 30,
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



    const leftDiv = document.querySelector('.leftDiv');
    console.log()
    charAnimation(leftDiv, 3, 600, true);

    const topLeftDiv = document.querySelector('.topLeftDiv');
    charAnimation(topLeftDiv, 3, 800);

    const bottomLeftDiv = document.querySelector('.bottomLeftDiv');
    charAnimation(bottomLeftDiv, 3, 900, "abcdefwg");




}


