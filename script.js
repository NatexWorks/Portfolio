(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // One-time logo collision reveal: the visual overlay travels to the existing header brand, without changing page layout.
  const brandIntro = document.querySelector('#brand-collision-intro');
  const targetBrand = document.querySelector('.site-header > .brand');
  const introLogo = document.querySelector('.brand-intro-final');
  if (brandIntro && targetBrand && introLogo && !reducedMotion && typeof introLogo.animate === 'function') {
    document.documentElement.classList.add('brand-intro-running');
    window.setTimeout(() => {
      introLogo.classList.add('is-revealed');
      window.setTimeout(() => {
        const targetRect = targetBrand.getBoundingClientRect();
        const travel = introLogo.animate([
          { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(1)', filter: 'drop-shadow(0 0 18px #c5f36b55)' },
          { left: `${targetRect.left}px`, top: `${targetRect.top}px`, transform: 'translate(0, 0) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' }
        ], { duration: 780, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' });
        travel.onfinish = () => {
          brandIntro.remove();
          document.documentElement.classList.remove('brand-intro-running');
        };
      }, 260);
    }, 850);
  } else if (brandIntro) {
    brandIntro.remove();
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
        menuButton.focus();
      }
    });
  }

  // Reveal project visuals as they enter the viewport; avoid scroll-jacking/parallax.
  const scrollImages = document.querySelectorAll('[data-image-scroll]');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('image-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -24px 0px' });
    scrollImages.forEach((item) => imageObserver.observe(item));
  } else {
    scrollImages.forEach((item) => item.classList.add('image-in-view'));
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Keep content visible by default. Scroll reveals are enabled only when
  // IntersectionObserver is available and the visitor hasn't requested less motion.
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const revealItems = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  }
  
  // About copy types character-by-character in paced sequences when it enters view.
  const typingLines = Array.from(document.querySelectorAll('.typing-line'));
  if (typingLines.length && !reducedMotion) {
    typingLines.forEach((line) => {
      line.dataset.fullText = line.textContent;
      line.setAttribute('aria-label', line.textContent);
      line.textContent = '';
    });
    const typeLine = (line, done) => {
      const fullText = line.dataset.fullText || '';
      const speed = Number(line.dataset.typeSpeed) || 34;
      let index = 0;
      line.classList.add('is-typing');
      const typeNext = () => {
        index += 1;
        line.textContent = fullText.slice(0, index);
        if (index < fullText.length) {
          window.setTimeout(typeNext, speed);
        } else {
          line.classList.remove('is-typing');
          if (done) window.setTimeout(done, 220);
        }
      };
      typeNext();
    };
    const aboutCopy = document.querySelector('.about-inner');
    if ('IntersectionObserver' in window && aboutCopy) {
      const typingObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            let lineIndex = 0;
            const typeSequence = () => {
              if (lineIndex >= typingLines.length) return;
              typeLine(typingLines[lineIndex], () => {
                lineIndex += 1;
                typeSequence();
              });
            };
            typeSequence();
          }
        });
      }, { threshold: 0.18 });
      typingObserver.observe(aboutCopy);
    } else {
      typingLines.forEach((line) => { line.textContent = line.dataset.fullText || ''; });
    }
  }

  // Typewriter phrases: short, quick, and disabled for reduced-motion visitors.
  const typeTarget = document.querySelector('[data-rotate]');
  if (typeTarget && !reducedMotion) {
    const phrases = (typeTarget.dataset.rotate || '').split('|').filter(Boolean);
    let phraseIndex = 0;
    let charIndex = phrases[0]?.length || 0;
    let deleting = false;
    const type = () => {
      const phrase = phrases[phraseIndex] || '';
      if (!deleting) {
        charIndex = Math.min(charIndex + 1, phrase.length);
        typeTarget.textContent = phrase.slice(0, charIndex);
        if (charIndex === phrase.length) {
          deleting = true;
          window.setTimeout(type, 850);
          return;
        }
      } else {
        charIndex = Math.max(0, charIndex - 1);
        typeTarget.textContent = phrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      window.setTimeout(type, deleting ? 20 : 35);
    };
    window.setTimeout(() => { deleting = true; type(); }, 1200);
  }
})();