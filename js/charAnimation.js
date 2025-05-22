export function charAnimation(
    leftElement,
    delay,
    delayStart = 1000,
    chars = "x", // Can be a sequence like '░▒▓'
    color = "var(--light-blue)"
) {
    const calculateCapacity = (element) => {
        const elementWidth = element.offsetWidth;
        return Math.floor(elementWidth / 14); // Approximate char width
    };

    // Stabilize the container layout
    leftElement.style.transition = '';
    leftElement.style.opacity = 1;
    // Don't change line height, preserve original
    leftElement.style.verticalAlign = 'baseline'; // Fix vertical alignment

    let lastUpdate = performance.now();
    let charIndex = 0;

    setTimeout(() => {
        const leftCapacity = calculateCapacity(leftElement);
        const maxChars = leftCapacity * 3;
        console.log("delay", delay)
        const animate = (now) => {
            if (now - lastUpdate >= delay) {
                if (charIndex < maxChars) {
                    const ch = chars[charIndex % chars.length]; // Cycle through chars
                    const span = document.createElement('span');
                    span.textContent = ch;
                    span.style.color = ch === '░' ? 'var(--light-blue)' : color;
                    // Stabilize span properties
                    span.style.lineHeight = 'inherit';
                    span.style.verticalAlign = 'baseline';
                    span.style.display = 'inline';
                    span.style.margin = '0';
                    span.style.padding = '0';

                    leftElement.insertBefore(span, leftElement.firstChild);
                    charIndex++;
                    lastUpdate = now;
                } else {
                    // Force a final layout calculation to prevent shifts
                    leftElement.offsetHeight; // Trigger reflow
                    return; // Animation complete
                }
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, delayStart);
}
