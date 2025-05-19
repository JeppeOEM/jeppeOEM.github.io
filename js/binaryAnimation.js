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
