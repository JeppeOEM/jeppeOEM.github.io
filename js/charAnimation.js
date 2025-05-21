export function charAnimation(leftElement, delay = 50, delayStart = 1000, chars = "x", color = "var(--blue)") {
    const calculateCapacity = (element) => {
        const elementWidth = element.offsetWidth;
        return Math.floor(elementWidth / 14); // Approx. width per char for monospace
    };
    // Reset any existing transition
    leftElement.style.transition = '';
    leftElement.style.opacity = 1;

    let leftContent = '';

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);
        const maxChars = leftCapacity * 3; // Fill to 4x capacity then fade out

        const updateLeft = () => {
            if (leftContent.length < maxChars) {
                // Add new character (using the chars parameter directly as specified)
                const newBit = chars;
                leftContent = newBit + leftContent;

                // Color each bit
                const coloredContent = [...leftContent]
                    .map(bit => `<span style="color: ${bit === '░' ? 'var(--light-blue)' : color};">${bit}</span>`)
                    .join('');

                leftElement.innerHTML = coloredContent;
                setTimeout(updateLeft, delay);
            } else {
                // Animation complete - fade out with 1s transition
                // leftElement.style.transition = 'opacity 2s ease-out';
                // leftElement.style.opacity = 0;
            }
        };

        updateLeft();
    }, delayStart);
}
