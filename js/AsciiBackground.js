export default class AsciiBackground {
    /**
     * Create a new ASCII art background
     * @param {Object} config - Configuration options
     * @param {string} config.asciiArt - The ASCII art string
     * @param {HTMLElement} config.container - Container element for the background
     * @param {Object} [config.style] - Optional style configurations
     * @param {string} [config.style.color='#333'] - Text color
     * @param {number} [config.style.opacity=0.15] - Opacity (0-1)
     * @param {string} [config.style.backgroundColor='transparent'] - Background color
     * @param {boolean} [config.disableSelection=true] - Disable text selection
     */
    constructor(config) {
        /** @type {HTMLElement} */
        this.container = config.container;
        /** @type {string} */
        this.asciiArt = config.asciiArt;
        /** @type {Object} */
        this.style = {
            color: config.style?.color || '#333',
            opacity: config.style?.opacity || 1,
            backgroundColor: config.style?.backgroundColor || 'transparent',
            zIndex: config.style?.zIndex || -1
        };
        /** @type {boolean} */
        this.disableSelection = config.disableSelection !== false;

        // Initialize properties
        /** @type {HTMLDivElement} */
        this.backgroundElement = null;
        /** @type {HTMLPreElement} */
        this.centerArt = null;
        /** @type {HTMLDivElement} */
        this.gridContainer = null;

        // Setup
        this.initialize(this.style.zIndex);
    }

    /**
     * Initialize the background
     * @private
     */
    initialize(zIndex) {
        // Set container to position relative if not already set
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }

        // Create background container
        this.backgroundElement = document.createElement('div');
        this.backgroundElement.style.position = 'absolute';
        this.backgroundElement.style.top = '0';
        this.backgroundElement.style.left = '0';
        this.backgroundElement.style.width = '100%';
        this.backgroundElement.style.height = '100%';
        this.backgroundElement.style.overflow = 'hidden';
        this.backgroundElement.style.zIndex = zIndex;
        this.backgroundElement.style.display = 'flex';
        this.backgroundElement.style.justifyContent = 'center';
        this.backgroundElement.style.alignItems = 'center';
        this.backgroundElement.style.backgroundColor = this.style.backgroundColor;

        if (this.disableSelection) {
            this.backgroundElement.style.userSelect = 'none';
            this.backgroundElement.style.webkitUserSelect = 'none';
            this.backgroundElement.style.msUserSelect = 'none';
        }

        // Create ASCII container
        const asciiContainer = document.createElement('div');
        asciiContainer.style.position = 'relative';

        // Create center art
        this.centerArt = document.createElement('pre');
        this.centerArt.className = 'ascii-center-art';
        this.centerArt.style.margin = '0';
        this.centerArt.style.padding = '0';
        this.centerArt.style.color = this.style.color;
        this.centerArt.style.opacity = this.style.opacity;
        this.centerArt.style.pointerEvents = 'none';
        this.centerArt.textContent = this.asciiArt;

        // Create grid for repetitions
        this.gridContainer = document.createElement('div');
        this.gridContainer.style.position = 'absolute';
        this.gridContainer.style.top = '50%';
        this.gridContainer.style.left = '50%';
        this.gridContainer.style.transform = 'translate(-50%, -50%)';
        this.gridContainer.style.display = 'grid';
        this.gridContainer.style.pointerEvents = 'none';

        // Append elements
        asciiContainer.appendChild(this.centerArt);
        asciiContainer.appendChild(this.gridContainer);
        this.backgroundElement.appendChild(asciiContainer);
        this.container.appendChild(this.backgroundElement);

        // Initialize grid
        this.updateGrid();

        // Add event listeners
        this.resizeObserver = new ResizeObserver(() => this.updateGrid());
        this.resizeObserver.observe(this.container);
    }

    /**
     * Update grid dimensions and content
     */
    updateGrid() {
        // Get art dimensions
        /** @type {CSSStyleDeclaration} */
        const artStyle = window.getComputedStyle(this.centerArt);
        /** @type {number} */
        const fontSize = parseFloat(artStyle.fontSize);

        // Count lines and max line length
        /** @type {string} */
        const artText = this.centerArt.textContent;
        /** @type {string[]} */
        const lines = artText.split('\n');
        /** @type {number} */
        const lineCount = lines.length;
        /** @type {number} */
        const maxLineLength = Math.max(...lines.map(line => line.length));

        // Approximate dimensions of the art
        /** @type {number} */
        const artWidth = maxLineLength * (fontSize * 0.6);
        /** @type {number} */
        const artHeight = lineCount * fontSize * 1.2;

        // Get container dimensions
        /** @type {DOMRect} */
        const containerRect = this.container.getBoundingClientRect();
        /** @type {number} */
        const containerWidth = containerRect.width;
        /** @type {number} */
        const containerHeight = containerRect.height;

        // Calculate repeats needed
        /** @type {number} */
        const columnsNeeded = Math.ceil(containerWidth / artWidth) + 2;
        /** @type {number} */
        const rowsNeeded = Math.ceil(containerHeight / artHeight) + 2;

        // Calculate total grid size
        /** @type {number} */
        const totalColumns = columnsNeeded * 2 + 1;
        /** @type {number} */
        const totalRows = rowsNeeded * 2 + 1;

        // Set grid dimensions
        this.gridContainer.style.gridTemplateColumns = `repeat(${totalColumns}, auto)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${totalRows}, auto)`;

        // Clear existing grid
        this.gridContainer.innerHTML = '';

        // Center coordinates
        /** @type {number} */
        const centerCol = Math.floor(totalColumns / 2);
        /** @type {number} */
        const centerRow = Math.floor(totalRows / 2);

        // Fill grid with art instances
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalColumns; col++) {
                // Skip center cell (already has the original art)
                if (row === centerRow && col === centerCol) continue;

                /** @type {HTMLPreElement} */
                const pre = document.createElement('pre');
                pre.className = 'ascii-repeat-item';
                pre.style.margin = '0';
                pre.style.padding = '0';
                pre.style.zIndex = '1'
                pre.style.gridColumn = col + 1;
                pre.style.gridRow = row + 1;
                pre.style.color = this.style.color;
                pre.style.opacity = this.style.opacity;
                pre.textContent = this.asciiArt;
                this.gridContainer.appendChild(pre);
            }
        }
    }

    /**
     * Update the ASCII art
     * @param {string} newArt - New ASCII art string
     */
    setAsciiArt(newArt) {
        this.asciiArt = newArt;
        this.centerArt.textContent = newArt;
        this.updateGrid();
    }

    /**
     * Update the style properties
     * @param {Object} newStyle - New style properties
     * @param {string} [newStyle.color] - Text color
     * @param {number} [newStyle.opacity] - Opacity (0-1)
     * @param {string} [newStyle.backgroundColor] - Background color
     */
    setStyle(newStyle) {
        if (newStyle.color) {
            this.style.color = newStyle.color;
            this.centerArt.style.color = newStyle.color;

            // Update all grid items
            const items = this.gridContainer.querySelectorAll('.ascii-repeat-item');
            items.forEach(item => {
                item.style.color = newStyle.color;
            });
        }

        if (typeof newStyle.opacity === 'number') {
            this.style.opacity = newStyle.opacity;
            this.centerArt.style.opacity = newStyle.opacity;

            // Update all grid items
            const items = this.gridContainer.querySelectorAll('.ascii-repeat-item');
            items.forEach(item => {
                item.style.opacity = newStyle.opacity;
            });
        }

        if (newStyle.backgroundColor) {
            this.style.backgroundColor = newStyle.backgroundColor;
            this.backgroundElement.style.backgroundColor = newStyle.backgroundColor;
        }
    }

    /**
     * Remove the background and clean up resources
     */
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this.backgroundElement && this.backgroundElement.parentNode) {
            this.backgroundElement.parentNode.removeChild(this.backgroundElement);
        }
    }
}


// Set up controls
