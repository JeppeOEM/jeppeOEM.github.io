export default class AsciiLogoBackground {
    constructor(config) {
        this.leftSection = config.leftSection;
        this.leftPre = config.leftPre;
        this.rightSection = config.rightSection;
        this.rightPre = config.rightPre;
        this.logoPre = config.logoPre;
        this.enableFadeIn = config.fadeInBackground || false;

        this.fillSections = this.fillSections.bind(this);
    }

    fillSections() {
        const leftSection = document.getElementById('leftSection');
        const rightSection = document.getElementById('rightSection');

        // Optionally apply fade-in class
        if (this.enableFadeIn) {
            leftSection.classList.add('fade-in');
            rightSection.classList.add('fade-in');
        }

        // Clear existing content
        leftSection.innerHTML = '';
        rightSection.innerHTML = '';

        const preWidth = 300;
        const viewportWidth = window.innerWidth;
        const availableWidthPerSide = viewportWidth;

        const leftPreCount = Math.ceil(availableWidthPerSide / preWidth) * 2;
        const rightPreCount = Math.ceil(availableWidthPerSide / preWidth) * 2;

        for (let i = 0; i < leftPreCount; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.leftPre;
            const preTag = tempDiv.firstElementChild;
            leftSection.appendChild(preTag);
        }

        for (let i = 0; i < rightPreCount; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.rightPre;
            const preTag = tempDiv.firstElementChild;
            rightSection.appendChild(preTag);
        }
    }

    init() {
        this.fillSections();
        window.addEventListener('resize', this.fillSections);
    }
}
