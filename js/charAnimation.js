export function charAnimation(
    leftElement,
    delay = 50,
    delayStart = 1000,
    chars = "x",
    color = "var(--light-blue)"
) {
    const calculateCapacity = (element) => {
        const elementWidth = element.offsetWidth;
        return Math.floor(elementWidth / 14); // Approx. width per char
    };

    leftElement.style.transition = '';
    leftElement.style.opacity = 1;

    let leftContent = '';
    let lastUpdate = performance.now();
    let charIndex = 0;

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);
        const maxChars = leftCapacity * 3;

        const animate = (now) => {
            if (now - lastUpdate >= delay) {
                if (charIndex < maxChars) {
                    leftContent = chars + leftContent;

                    console.log([...leftContent]);
                    const coloredContent = [...leftContent]
                        .map(bit => `<span style="color: ${bit === '░' ? 'var(--light-blue)' : color};">${bit}</span>`)
                        .join('');
                    leftElement.innerHTML = coloredContent;

                    charIndex++;
                    lastUpdate = now;
                } else {
                    return; // done
                }
            }
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, delayStart);
}
