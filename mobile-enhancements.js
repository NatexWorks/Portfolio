/* Mobile-only, accessible word reveals and shared navigation behaviour. */
(() => {
  const mobile = window.matchMedia('(max-width: 760px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const menuButton = document.querySelector('.site-header .menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (menuButton && nav) {
    const links = Array.from(nav.querySelectorAll('a[href]'));
    let previousOverflow = '';
    const setOpen = (open, restoreFocus = false) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      if (mobile.matches) {
        if (open) {
          previousOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          links[0]?.focus({ preventScroll: true });
        } else {
          document.body.style.overflow = previousOverflow;
          if (restoreFocus) menuButton.focus({ preventScroll: true });
        }
      }
    };
    menuButton.addEventListener('click', () => {
      setOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    links.forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', event => {
      if (!nav.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        setOpen(false, true);
      } else if (event.key === 'Tab' && mobile.matches) {
        const focusable = [menuButton, ...links].filter(el => !el.hasAttribute('disabled'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
    const onViewportChange = () => {
      if (!mobile.matches) {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        document.body.style.overflow = previousOverflow;
      }
    };
    mobile.addEventListener?.('change', onViewportChange);
  }

  if (!mobile.matches || reducedMotion) return;

  const revealWords = (element, addSmoke = false) => {
    if (!element || element.dataset.mobileWordsReady === 'true') return;
    const fullText = element.textContent.replace(/\s+/g, ' ').trim();
    if (!fullText) return;
    element.dataset.mobileWordsReady = 'true';
    element.setAttribute('aria-label', fullText);
    element.dataset.mobileWordReveal = 'true';
    const words = fullText.split(' ');
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'mobile-reveal-word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--word-delay', Math.min(index * 48, 1800) + 'ms');
      span.textContent = word;
      if (addSmoke) {
        span.style.textShadow = '0 0 10px rgba(197,243,107,.12)';
      }
      fragment.append(span);
      if (index < words.length - 1) fragment.append(document.createTextNode(' '));
    });
    element.replaceChildren(fragment);
    element.classList.add('mobile-word-sequence');
  };

  const serviceHeading = document.querySelector('.services-page-hero h1');
  if (serviceHeading) {
    const original = serviceHeading.innerHTML;
    const text = serviceHeading.innerText.replace(/\s+/g, ' ').trim();
    serviceHeading.setAttribute('aria-label', text);
    const words = text.split(' ');
    serviceHeading.replaceChildren();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'mobile-reveal-word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--word-delay', Math.min(index * 90, 1100) + 'ms');
      span.textContent = word;
      serviceHeading.append(span);
      if (index < words.length - 1) serviceHeading.append(document.createTextNode(' '));
    });
    void original;
  }

  const heroParagraph = document.querySelector('[data-services-hero-typewriter]');
  if (heroParagraph) revealWords(heroParagraph, true);

  const visibilityNote = document.querySelector('.service-principle[data-services-motion="visibility-note"] p');
  if (visibilityNote) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || visibilityNote.dataset.mobileWordsReady === 'true') return;
        revealWords(visibilityNote, true);
        observer.disconnect();
      });
    }, { threshold: 0.18 });
    observer.observe(visibilityNote);
  }

  document.querySelectorAll('.services-process-step').forEach((step, index) => {
    step.style.setProperty('--step-order', String(index));
  });
})();
