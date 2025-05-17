export default class AsciiBox {
    constructor(config) {
        this.templateClosestChild = config.templateClosestChild;
        this.template = config.template;
        this.tabletBreakpoint = config.tabletBreakpoint;
        this.mobileBreakpoint = config.mobileBreakpoint;
        this.desktopBreakpoint = config.desktopBreakpoint;
        this.currentTemplate = null; // Track the current template element
    }

    getBreakpoint(width) {
        if (width < this.mobileBreakpoint.breakpoint) return 'mobile';
        if (width < this.tabletBreakpoint.breakpoint) return 'tablet';
        return 'desktop';
    }

    createResponsiveTemplate() {
        // Remove existing template if any
        if (this.currentTemplate) {
            this.currentTemplate.parentNode.removeChild(this.currentTemplate);
            this.currentTemplate = null;
        }

        // Get the template
        const templateElement = this.template;
        if (!templateElement) {
            console.error("Template element not found");
            return;
        }

        // Clone the template content
        const templateContent = templateElement.content.cloneNode(true);

        // Calculate responsive values based on screen width
        const screenWidth = window.innerWidth;
        let baseCharCount, verticalLines;

        // Determine character count and number of vertical lines based on screen width
        if (screenWidth < this.mobileBreakpoint.breakpoint) {
            baseCharCount = this.mobileBreakpoint.horizontalChars;
            verticalLines = this.mobileBreakpoint.verticalLines;
        } else if (screenWidth < this.tabletBreakpoint.breakpoint) {
            baseCharCount = this.tabletBreakpoint.horizontalChars;
            verticalLines = this.tabletBreakpoint.verticalLines;
        } else {
            baseCharCount = this.desktopBreakpoint.horizontalChars;
            verticalLines = this.desktopBreakpoint.verticalLines;
        }

        // Update all responsive spans in the new template
        const spans = templateContent.querySelectorAll('.responsive-span');
        spans.forEach(span => {
            let charCount = baseCharCount;
            let useEmpty = false;

            // Check class list for modifiers
            span.classList.forEach(cls => {
                const minusMatch = cls.match(/^minus(\d+)$/);
                if (minusMatch) {
                    const minus = parseInt(minusMatch[1], 10);
                    charCount = Math.max(0, charCount - minus);
                }
                if (cls === 'empty') {
                    useEmpty = true;
                }
            });

            span.textContent = (useEmpty ? ' ' : '─').repeat(charCount);
        });

        // Remove existing vertical lines first
        const existingLines = templateContent.querySelectorAll('.vertical-line');
        existingLines.forEach(line => line.remove());

        // Add vertical lines if needed
        if (verticalLines > 0) {
            const pre = templateContent.querySelector('.ascii-box');
            const columnMarker = pre.querySelector('.column');
            if (columnMarker) {
                const lineHTML = `<span class="vertical-line">│ │ │<span class="responsive-span empty">${' '.repeat(baseCharCount)}</span>│ │ │</span>`;
                for (let i = 0; i < verticalLines; i++) {
                    // Create a new line element
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = lineHTML;
                    const newLine = tempDiv.firstChild;

                    // Insert the new line before the column marker
                    pre.insertBefore(newLine, columnMarker);
                    pre.insertBefore(document.createTextNode('\n'), columnMarker);
                }
            }
        }

        // Append to body and store reference to the newly added content
        document.body.appendChild(templateContent);

        // Store reference to the newly added root element
        // This assumes the template has a single root element
        this.currentTemplate = document.body.lastElementChild;
    }

    init() {
        let currentBreakpoint = this.getBreakpoint(window.innerWidth);
        this.createResponsiveTemplate();

        window.addEventListener('resize', () => {
            const newBreakpoint = this.getBreakpoint(window.innerWidth);
            if (newBreakpoint !== currentBreakpoint) {
                currentBreakpoint = newBreakpoint;
                this.createResponsiveTemplate();
            }
        });
    }
}
