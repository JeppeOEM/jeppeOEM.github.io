export default class AsciiBox {
    constructor(config) {
        this.templateClosestChild = config.templateClosestChild;
        this.template = config.template;
        this.tabletBreakpoint = config.tabletBreakpoint;
        this.mobileBreakpoint = config.mobileBreakpoint;
        this.desktopBreakpoint = config.desktopBreakpoint;
        this.delay = config.delay || 4000 // milliseconds
        this.currentTemplate = null;
        this.hasFadedIn = false;
        this.styleTextContent = config.styleTextContent
    }

    getBreakpoint(width) {
        if (width < this.mobileBreakpoint.breakpoint) return 'mobile';
        if (width < this.tabletBreakpoint.breakpoint) return 'tablet';
        return 'desktop';
    }

    injectFadeStyle() {
        if (document.getElementById('ascii-fade-style')) return;

        const style = document.createElement('style');
        style.id = 'ascii-fade-style';
        style.textContent = this.styleTextContent
        document.head.appendChild(style);
    }

    createResponsiveTemplate() {
        // Remove existing template if any
        if (this.currentTemplate) {
            this.currentTemplate.remove();
            this.currentTemplate = null;
        }

        this.injectFadeStyle();

        const templateElement = this.template;
        if (!templateElement) {
            console.error("Template element not found");
            return;
        }

        const templateContent = templateElement.content.cloneNode(true);

        // Determine breakpoint settings
        const screenWidth = window.innerWidth;
        let baseCharCount, verticalLines;

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

        // Handle responsive spans
        const spans = templateContent.querySelectorAll('.responsive-span');
        spans.forEach(span => {
            let charCount = baseCharCount;
            let useEmpty = false;

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

        // Add vertical lines if needed
        const pre = templateContent.querySelector('.ascii-box');
        const columnMarker = pre?.querySelector('.column');
        if (columnMarker && verticalLines > 0) {
            const lineHTML = `<span class="vertical-line">│ │ │<span class="responsive-span empty">${' '.repeat(baseCharCount)}</span>│ │ │</span>`;
            for (let i = 0; i < verticalLines; i++) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = lineHTML;
                const newLine = tempDiv.firstChild;
                pre.insertBefore(newLine, columnMarker);
                pre.insertBefore(document.createTextNode('\n'), columnMarker);
            }
        }

        // Wrap the template content
        const wrapper = document.createElement('div');
        wrapper.appendChild(templateContent);

        // Apply fade-in only on first load
        if (!this.hasFadedIn) {
            wrapper.classList.add('fade-in-box');
            document.body.appendChild(wrapper);

            setTimeout(() => {
                requestAnimationFrame(() => {
                    wrapper.classList.add('show');
                });
            }, this.delay);

            this.hasFadedIn = true;
        } else {
            document.body.appendChild(wrapper);
        }

        this.currentTemplate = wrapper;
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
