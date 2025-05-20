import AsciiLogoBackground from "./AsciiLogoBackground.js";
import { leftPre, rightPre } from "./linkBackground.js";

export function linksPage() {

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


