export function startBinaryAnimation(leftElement, delay = 50, delayStart = 1000) {
    const calculateCapacity = (element) => {
        const elementWidth = element.offsetWidth;
        return Math.floor(elementWidth / 14); // Approx. width per char for monospace
    };

    const generateRandomBit = () => Math.floor(Math.random() * 2).toString();

    let leftContent = '';

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);

        const updateLeft = () => {
            if (leftContent.length < leftCapacity * 4) {
                const newBit = generateRandomBit();
                leftContent = newBit + leftContent;

                // Color each bit
                const coloredContent = [...leftContent]
                    .map(bit => `<span style="color: ${bit === '1' ? 'var(--light-green)' : 'var(--dark-green)'};">${bit}</span>`)
                    .join('');

                leftElement.innerHTML = coloredContent;

                setTimeout(updateLeft, delay);
            }
        };

        updateLeft();
    }, delayStart);
}
