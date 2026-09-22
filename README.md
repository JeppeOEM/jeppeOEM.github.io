### Site url

https://jeppeoem.github.io/

### Disclaimer
 
It’s very much a WORK IN PROGRESS and where i experiment, and there is still a backlog of bugs and ideas that I’m still working through, but as i am proud of my ANSI art 😀 i decided to pin this project anyways.

### Description

In an era of giant node_modules folders, I decided to take a step back for my personal portfolio site. Instead of relying on big frameworks and their dependencies, I built it as an old-school static website using nothing but vanilla JavaScript for the sake of simplicity.

Furthermore i restrained myself to a design made only of the same fontsize characters, to mimic the look of purely textbased designs of the BBS's of the pre internet.

I embedded Andreas Gysin's JavaScript animation engine (https://ertdfgcvb.xyz/) to create the animation on the front page.

The site is very much a playground where I experiment with bringing ANSI art onto the web and make it styleable with CSS animations, since ANSI isn’t naturally compatible with the web, and every ANSI to HTML converter I’ve tried does a poor job in regards to making it easy to animate with CSS, i had to come try different approaches to achieve my look and is still searching to streamline the whole process of making web pages purely text based.

### Background animations on the projects page

`code.html` draws its background on a full-page [p5.js](https://p5js.org/) canvas
(`js/P5Background.js`, instance mode, loaded from a pinned CDN URL). One animation runs at a
time, picked from the registry in `js/animations/index.js`:

- `?anim=<name>` in the URL picks one, e.g. `code.html?anim=hexRain`
- in the browser console: `p5Background.list()`, `p5Background.run("flowField")`, `p5Background.next()`

To add one, create `js/animations/<name>.js` exporting an object with `setup(p, bg)` and
`draw(p, bg)` (optional `resize`, `pointer`, `holesChanged`, `destroy`), then register it in
`js/animations/index.js`. `p` is the p5 instance; `bg` gives the page's colours, font, cell
size and the rectangles behind the text box that must stay empty. The contract is documented
at the top of `js/P5Background.js`.
