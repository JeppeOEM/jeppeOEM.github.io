export default class AsciiBox {
    constructor(config) {
        // Store configuration parameters
        this.templateClosestChild = config.templateClosestChild;
        this.template = config.template;
        this.tabletBreakpoint = config.tabletBreakpoint;
        this.mobileBreakpoint = config.mobileBreakpoint;
        this.desktopBreakpoint = config.desktopBreakpoint;
        this.delay = config.delay || 4000; // milliseconds
        this.currentTemplate = null;
        this.hasFadedIn = false;
        this.styleTextContent = config.styleTextContent;

        // Bind methods to maintain proper 'this' context
        this.handleResize = this.handleResize.bind(this);
    }

    getBreakpoint(width = document.documentElement.clientWidth) {
        // Use window.innerWidth for more reliable width detection
        if (width < this.mobileBreakpoint.breakpoint) return 'mobile';
        if (width < this.tabletBreakpoint.breakpoint) return 'tablet';
        return 'desktop';
    }

    getBreakpointSettings(breakpoint) {
        switch (breakpoint) {
            case 'mobile':
                return this.mobileBreakpoint;
            case 'tablet':
                return this.tabletBreakpoint;
            case 'desktop':
            default:
                return this.desktopBreakpoint;
        }
    }

    injectFadeStyle() {
        if (document.getElementById('ascii-fade-style')) return;

        const style = document.createElement('style');
        style.id = 'ascii-fade-style';
        style.textContent = this.styleTextContent;
        document.head.appendChild(style);
    }

    createResponsiveTemplate() {
        // Remove existing template if any
        if (this.currentTemplate) {
            this.currentTemplate.remove();
            this.currentTemplate = null;
        }

        this.injectFadeStyle();

        // Check if template exists
        if (!this.template) {
            console.error("Template element not found");
            return;
        }

        const templateContent = this.template.content.cloneNode(true);

        // Determine current breakpoint and get settings
        const currentBreakpoint = this.getBreakpoint();
        const { horizontalChars, verticalLines, verticalHeaderLines } = this.getBreakpointSettings(currentBreakpoint);

        console.log(`Current breakpoint: ${currentBreakpoint}, Chars: ${horizontalChars}, Lines: ${verticalLines}`);

        // Handle responsive spans
        const spans = templateContent.querySelectorAll('.responsive-span');
        spans.forEach(span => {
            let charCount = horizontalChars;
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

        const headerColumnMarker = pre?.querySelector('.header-column');

        const lineHTML = `<span class="vertical-line">│   │<span class="responsive-span empty">${' '.repeat(horizontalChars)}</span>│   │</span>`;

        if (pre && columnMarker && verticalLines > 0) {
            // Create a template for vertical lines
            this.insertVertical(columnMarker, verticalLines, lineHTML, pre)
        }

        if (pre && headerColumnMarker && verticalHeaderLines > 0) {
            // Create a template for vertical lines
            this.insertVertical(headerColumnMarker, verticalHeaderLines, lineHTML, pre)
        }
        // Wrap the template content
        const wrapper = document.createElement('div');
        wrapper.classList.add('ascii-box-wrapper');
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


    insertVertical(element, lines, html, pre) {

        for (let i = 0; i < lines; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newLine = tempDiv.firstChild;

            pre.insertBefore(newLine, element);
            pre.insertBefore(document.createTextNode('\n'), element);
        }
    }

    handleResize() {
        const newBreakpoint = this.getBreakpoint();

        // Only recreate template if breakpoint changes
        if (newBreakpoint !== this._currentBreakpoint) {
            this._currentBreakpoint = newBreakpoint;
            this.createResponsiveTemplate();
        }
    }

    init() {
        // Store initial breakpoint
        this._currentBreakpoint = this.getBreakpoint();
        console.log(`Initializing with breakpoint: ${this._currentBreakpoint}`);

        // Create initial template
        this.createResponsiveTemplate();

        // Add resize event listener
        window.addEventListener('resize', this.handleResize);
    }

    destroy() {
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);

        // Remove template from DOM
        if (this.currentTemplate) {
            this.currentTemplate.remove();
            this.currentTemplate = null;
        }
    }
}
