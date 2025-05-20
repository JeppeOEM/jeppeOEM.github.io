export function horizontalBinaryAnimation(containerElement, delay = 50, delayStart = 1000) {
    const generateRandomBit = () => Math.floor(Math.random() * 2).toString();

    // Create an inner span to hold and animate the text
    const contentSpan = document.createElement('span');
    contentSpan.className = 'scrollingContent';
    contentSpan.style.display = 'inline-block';
    contentSpan.style.willChange = 'transform';
    contentSpan.style.transition = `transform ${delay}ms linear`;

    containerElement.appendChild(contentSpan);

    let binaryString = '';

    setTimeout(() => {
        const update = () => {
            binaryString += generateRandomBit();
            contentSpan.textContent = binaryString;

            const containerWidth = containerElement.offsetWidth * 3;
            const contentWidth = contentSpan.offsetWidth;

            // Translate only when content exceeds container
            if (contentWidth > containerWidth) {
                const overflow = contentWidth - containerWidth;
                contentSpan.style.transform = `translateX(-${overflow}px)`;
            }

            setTimeout(update, delay);
        };

        update();
    }, delayStart);
}


export function charAnimation(leftElement, delay = 50, delayStart = 1000, reverse = true, characters = '', sequential = false) {
    const calculateCapacity = (element) => {
        const elementWidth = element.offsetWidth;
        const capacity = Math.floor(elementWidth / 14); // Approx. width per char for monospace
        console.log(`[DEBUG] Element width: ${elementWidth}px, Calculated capacity: ${capacity}`);
        return capacity;
    };

    // Track position in sequence if using sequential mode
    let sequenceIndex = 0;

    const generateChar = () => {
        // If custom characters are provided, use them
        if (characters && characters.length > 0) {
            if (sequential) {
                // Use characters in sequence
                const char = characters.charAt(sequenceIndex);
                sequenceIndex = (sequenceIndex + 1) % characters.length; // Loop through the sequence
                console.log(`[DEBUG] Generated sequential char: ${char} (index: ${sequenceIndex - 1})`);
                return char;
            } else {
                // Use random characters from the provided string
                const randomIndex = Math.floor(Math.random() * characters.length);
                const char = characters.charAt(randomIndex);
                console.log(`[DEBUG] Generated random custom char: ${char}`);
                return char;
            }
        } else {
            // Original binary functionality (0 or 1)
            const bit = Math.floor(Math.random() * 2).toString();
            console.log(`[DEBUG] Generated bit: ${bit}`);
            return bit;
        }
    };

    let leftContent = '';
    console.log(`[DEBUG] Starting animation in ${delayStart}ms...`);
    console.log(`[DEBUG] Animation direction: ${reverse ? 'reverse (append)' : 'normal (prepend)'}`);
    console.log(`[DEBUG] Characters: ${characters || 'binary (0,1)'}`);
    console.log(`[DEBUG] Mode: ${sequential ? 'sequential' : 'random'}`);

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);
        const targetLength = leftCapacity * 4;
        console.log(`[DEBUG] Animation started. Target length: ${targetLength}`);

        const updateLeft = () => {
            if (leftContent.length < targetLength) {
                const newChar = generateChar();

                // Append or prepend based on `reverse` flag, exactly as your original
                leftContent = reverse ? leftContent + newChar : newChar + leftContent;

                console.log(`[DEBUG] Current content length: ${leftContent.length}`);
                console.log(`[DEBUG] Current content: ${reverse ? leftContent.slice(-32) : leftContent.slice(0, 32)}...`);

                // Color handling for binary or custom characters
                const coloredContent = [...leftContent]
                    .map(char => {
                        if (!characters) {
                            // Original binary coloring
                            return `<span style="color: ${char === '1' ? 'var(--light-green)' : 'var(--dark-green)'};">${char}</span>`;
                        } else {
                            // For custom characters - generate color based on character code
                            const hue = (char.charCodeAt(0) * 37) % 360;
                            return `<span style="color: hsl(${hue}, 80%, 50%);">${char}</span>`;
                        }
                    })
                    .join('');

                leftElement.innerHTML = coloredContent;
                setTimeout(updateLeft, delay);
            } else {
                console.log(`[DEBUG] Animation complete. Final character count: ${leftContent.length}`);
            }
        };

        updateLeft();
    }, delayStart);
}
