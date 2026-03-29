// Archived on 2026-03-29 before first/last-4 rewrite.
export function colorWordStartsInDotSeperationBrackets(container = document) {
  const spans = container.querySelectorAll('.dot-seperation .span-purple');
  const textNodes = [];

  spans.forEach((span) => {
    const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const p = node.parentElement;
      if (!p) continue;
      if (p.closest('.span-second-accent')) continue;
      if (!node.textContent.trim()) continue;
      textNodes.push(node);
    }
  });

  textNodes.forEach((textNode) => {
    const text = textNode.textContent;
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      const isLetter = /[a-zA-Z]/.test(char);
      const prevIsLetter = i > 0 && /[a-zA-Z]/.test(text[i - 1]);
      if (isLetter && !prevIsLetter) {
        const s1 = document.createElement('span');
        s1.className = 'word-letter-1';
        s1.textContent = char;
        frag.appendChild(s1);
        i++;
        if (i < text.length && /[a-zA-Z]/.test(text[i])) {
          const s2 = document.createElement('span');
          s2.className = 'word-letter-2';
          s2.textContent = text[i];
          frag.appendChild(s2);
          i++;
        }
      } else {
        let plain = '';
        while (i < text.length) {
          const c = text[i];
          const isL = /[a-zA-Z]/.test(c);
          const prevIsL = i > 0 && /[a-zA-Z]/.test(text[i - 1]);
          if (isL && !prevIsL) break;
          plain += c;
          i++;
        }
        frag.appendChild(document.createTextNode(plain));
      }
    }
    textNode.parentNode.replaceChild(frag, textNode);
  });
}
