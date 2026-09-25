// Fills the sections beside the logo with copies of a <pre> of side art,
// enough to overflow the widest window, and refills them on resize.
export default class AsciiLogoBackground {
  constructor(config) {
    this.leftSection = config.leftSection;
    this.rightSection = config.rightSection;
    this.leftPre = config.leftPre;
    this.rightPre = config.rightPre;
    this.fillSections = this.fillSections.bind(this);
  }

  fillSections() {
    // estimated width of one pre; doubled so the sections always overflow
    const preWidth = 300;
    const count = Math.ceil(window.innerWidth / preWidth) * 2;
    this.fill(this.leftSection, this.leftPre, count);
    this.fill(this.rightSection, this.rightPre, count);
  }

  fill(section, html, count) {
    section.innerHTML = "";
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    for (let i = 0; i < count; i++) {
      section.appendChild(template.content.firstElementChild.cloneNode(true));
    }
  }

  init() {
    this.fillSections();
    window.addEventListener("resize", this.fillSections);
  }
}
