import AsciiBackground from "./AsciiBackground.js"
import AsciiBox from "./AsciiBox.js"
import AsciiLogoBackground from "./AsciiLogoBackground.js"

import { patterns } from "./asciiPatterns.js"
import { leftPre, rightPre } from "./codeBackground.js";

export function code() {


  const bodyBackground = new AsciiBackground({
    asciiArt: patterns.pattern1,
    container: document.body,
    style: {
      color: 'green',
      opacity: 1,
      zIndex: -1
    }
  });

  // NOTE: AsciiLogoBackground
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


  // NOTE: AsciiBox
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
      horizontalChars: 50,
      verticalLines: 20,
      breakpoint: 768
    },
    desktopBreakpoint: {
      horizontalChars: 70,
      verticalLines: 10
    }
  })

  asciiBox.init()

}
