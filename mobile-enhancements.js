/* Mobile-only, accessible word reveals and shared navigation behaviour. */
(() => {
  const mobile = window.matchMedia('(max-width: 760px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // script.js owns the existing menu toggle. Observe its state instead of registering
  // a second click handler, so the button never opens and closes in the same tap.
  const menuButton = document.querySelector('.site-header .menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (menuButton && nav) {
    let previousOverflow = '';
    const syncMenuState = () => {
      const open = nav.classList.contains('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      if (mobile.matches) {
        if (open && document.body.style.overflow !== 'hidden') {
          previousOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else if (!open && document.body.style.overflow === 'hidden') {
          document.body.style.overflow = previousOverflow;
        }
      } else if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = previousOverflow;
      }
    };
    new MutationObserver(syncMenuState).observe(nav, { attributes: true, attributeFilter: ['class'] });
    syncMenuState();
    document.addEventListener('keydown', event => {
      if (!mobile.matches || !nav.classList.contains('is-open') || event.key !== 'Tab') return;
      const focusable = [menuButton, ...Array.from(nav.querySelectorAll('a[href]'))];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    mobile.addEventListener?.('change', syncMenuState);
  }

  if (!mobile.matches || reducedMotion) return;

  const wrapTextNodes = (element, interval = 48) => {
    if (!element || element.dataset.mobileWordsReady === 'true') return;
    const fullText = element.textContent.replace(/\s+/g, ' ').trim();
    if (!fullText) return;
    element.dataset.mobileWordsReady = 'true';
    element.setAttribute('aria-label', fullText);
    let wordIndex = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue;
      if (!value || !value.trim()) return;
      const fragment = document.createDocumentFragment();
      const parts = value.split(/(\s+)/);
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'mobile-reveal-word';
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--word-delay', Math.min(wordIndex * interval, 1800) + 'ms');
          span.textContent = part;
          span.style.textShadow = '0 0 10px rgba(197,243,107,.12)';
          fragment.append(span);
          wordIndex += 1;
        }
      });
      node.replaceWith(fragment);
    });
    element.dataset.mobileWordReveal = 'true';
  };

  const serviceHeading = document.querySelector('.services-page-hero h1');
  if (serviceHeading) wrapTextNodes(serviceHeading, 90);

  const heroParagraph = document.querySelector('[data-services-hero-typewriter]');
  if (heroParagraph) wrapTextNodes(heroParagraph, 48);

  const visibilityNote = document.querySelector('.service-principle[data-services-motion="visibility-note"] p');
  if (visibilityNote && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || visibilityNote.dataset.mobileWordsReady === 'true') return;
        wrapTextNodes(visibilityNote, 54);
        observer.disconnect();
      });
    }, { threshold: 0.18 });
    observer.observe(visibilityNote);
  }
})();
