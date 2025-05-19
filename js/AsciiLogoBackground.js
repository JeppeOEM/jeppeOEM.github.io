
export default class AsciiLogoBackground {

    constructor(config) {
        this.leftSection = config.leftSection;
        this.leftPre = config.leftPre;
        this.rightSection = config.rightSection;
        this.rightPre = config.rightPre;
        this.logoPre = config.logoPre;
        // Bind the method to preserve 'this' context when used as callback
        this.fillSections = this.fillSections.bind(this);
    }

    fillSections() {

        const leftSection = document.getElementById('leftSection');
        const rightSection = document.getElementById('rightSection');
        //const leftSection = this.leftSection;
        //const rightSection = this.rightSection;

        // Clear existing content
        leftSection.innerHTML = '';
        rightSection.innerHTML = '';

        // Define HTML content for the pre tags
        // Get the width of a pre tag (estimate)
        const preWidth = 300; // Adjusted width estimate for the pre tags

        // Calculate how many pre tags we need on each side
        const viewportWidth = window.innerWidth;
        //const centerWidth = this.logoPre.offsetWidth;

        const availableWidthPerSide = viewportWidth; // Use full width to ensure overflow
        const leftPreCount = Math.ceil(availableWidthPerSide / preWidth) * 2; // Double for safety
        const rightPreCount = Math.ceil(availableWidthPerSide / preWidth) * 2; // Double for safety

        // Add left pre tags
        for (let i = 0; i < leftPreCount; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.leftPre;
            const preTag = tempDiv.firstElementChild;
            leftSection.appendChild(preTag);
        }

        // Add right pre tags
        for (let i = 0; i < rightPreCount; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.rightPre;
            const preTag = tempDiv.firstElementChild;
            rightSection.appendChild(preTag);
        }
    }

    init() {
        this.fillSections()

        window.addEventListener('resize', this.fillSections);
    }
}



// Refill when window is resized
