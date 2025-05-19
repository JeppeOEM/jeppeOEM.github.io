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
        console.log(element, "element")
        const elementWidth = element.offsetWidth;
        console.log(elementWidth)
        return Math.floor(elementWidth / 14); // Approx. width per char for monospace
    };

    const generateRandomBit = () => Math.floor(Math.random() * 2).toString();

    let leftContent = '';
    let rightContent = '';

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);
        //const rightCapacity = calculateCapacity(rightElement);

        const updateLeft = () => {
            if (leftContent.length < leftCapacity * 4) {
                leftContent = generateRandomBit() + leftContent;
                leftElement.textContent = leftContent;
                setTimeout(updateLeft, delay);
            }
        };

        //const updateRight = () => {
        //    if (rightContent.length < rightCapacity * 3) {
        //
        //        rightContent = rightContent + generateRandomBit();
        //        rightElement.textContent = rightContent;
        //        setTimeout(updateRight, delay);
        //    }
        //};

        updateLeft();
        //updateRight();
    }, delayStart);
}
