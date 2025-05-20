import AsciiLogoBackground from "./AsciiLogoBackground.js";
import AsciiBackground from "./AsciiBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";
import { dotPattern } from "./dotPattern.js"
import { horizontalBinaryAnimation, startBinaryAnimation } from "./binaryAnimation.js";



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
}


