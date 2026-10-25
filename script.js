(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Only the NX mark emerges from the collision cloud and travels to the existing header mark.
  const brandIntro = document.querySelector('#brand-collision-intro');
  const targetMark = document.querySelector('.site-header > .brand .brand-mark');
  const introMark = document.querySelector('.brand-intro-final');
  // Mobile-only premium shockwave, particles, and sparks between Natex and Works.
  const mobileBrandFX = window.matchMedia('(max-width: 760px)').matches;
  if (mobileBrandFX && brandIntro && !reducedMotion) {
    const shockwave = document.createElement('span');
    shockwave.className = 'brand-shockwave';
    shockwave.setAttribute('aria-hidden', 'true');
    brandIntro.appendChild(shockwave);
    const flash = document.createElement('span');
    flash.className = 'brand-flash';
    flash.setAttribute('aria-hidden', 'true');
    brandIntro.appendChild(flash);
    const particleColors = ['#c5f36b', '#efffd8', '#a9d65c', '#ffffff'];
    for (let i = 0; i < 28; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'brand-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.style.setProperty('--particle-angle', `${(360 / 28) * i + (i % 3) * 4}deg`);
      particle.style.setProperty('--particle-distance', `${42 + ((i * 17) % 86)}px`);
      particle.style.setProperty('--particle-size', `${2 + (i % 3)}px`);
      particle.style.setProperty('--particle-delay', `${(i % 6) * 22}ms`);
      particle.style.setProperty('--particle-color', particleColors[i % particleColors.length]);
      brandIntro.appendChild(particle);
    }
  }

  if (brandIntro && targetMark && introMark && !reducedMotion && typeof introMark.animate === 'function') {
    document.documentElement.classList.add('brand-intro-running');
    window.setTimeout(() => {
      introMark.classList.add('is-revealed');
      window.setTimeout(() => {
        const targetRect = targetMark.getBoundingClientRect();
        const travel = introMark.animate([
          { left: '50%', top: '50%', width: '58px', height: '58px', fontSize: '25px', transform: 'translate(-50%, -50%) scale(1)', filter: 'drop-shadow(0 0 18px #c5f36b55)' },
          { left: `${targetRect.left}px`, top: `${targetRect.top}px`, width: `${targetRect.width}px`, height: `${targetRect.height}px`, fontSize: '14px', transform: 'translate(0, 0) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' }
        ], { duration: 780, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' });
        travel.onfinish = () => {
          brandIntro.remove();
          document.documentElement.classList.remove('brand-intro-running');
          if (mobileBrandFX) document.documentElement.classList.add('hero-content-ready');
        };
      }, 260);
    }, 850);
  } else if (brandIntro) {
    brandIntro?.remove();
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

  // Mobile-only scroll-progress service stack. The desktop/tablet layout is untouched.
  const serviceStackMedia = window.matchMedia('(max-width: 760px)');
  const serviceStackGrid = document.querySelector('#services .service-grid');
  const serviceStackNext = document.querySelector('#skills');
  let serviceStackCards = serviceStackGrid
    ? Array.from(serviceStackGrid.querySelectorAll('.service-card'))
    : [];
  let serviceStackActive = false;
  let serviceStackFrame = 0;
  let serviceStackMetrics = null;

  const clampServiceProgress = (value) => Math.max(0, Math.min(1, value));

  const serviceDocumentTop = (element) => {
    let top = 0;
    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      top += current.offsetTop || 0;
      current = current.offsetParent;
    }
    return top;
  };

  const resetServiceStack = () => {
    if (serviceStackFrame) {
      window.cancelAnimationFrame(serviceStackFrame);
      serviceStackFrame = 0;
    }
    if (!serviceStackActive) return;
    serviceStackGrid.classList.remove('service-stack-enabled');
    serviceStackNext.classList.remove('service-stack-foreground');
    serviceStackGrid.style.removeProperty('transform');
    serviceStackGrid.style.removeProperty('transform-origin');
    serviceStackNext.style.removeProperty('transform');
    serviceStackCards.forEach((card) => {
      card.style.removeProperty('top');
      card.style.removeProperty('z-index');
      card.style.removeProperty('transform');
    });
    serviceStackActive = false;
    serviceStackMetrics = null;
  };

  const measureServiceStack = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const stackTop = Math.max(82, Math.min(108, viewportHeight * 0.13));
    const gridTop = serviceDocumentTop(serviceStackGrid);
    const gridStyles = window.getComputedStyle(serviceStackGrid);
    const gridGap = parseFloat(gridStyles.rowGap || gridStyles.gap) || 18;
    const gridPaddingTop = parseFloat(gridStyles.paddingTop) || 0;
    let cursor = gridTop + gridPaddingTop;
    const entries = [];

    serviceStackCards.forEach((card, index) => {
      const height = card.offsetHeight || 300;
      const stickyTop = stackTop + (serviceStackCards.length - index - 1) * 10;
      entries.push({ card, index, staticTop: cursor, stickyTop, height });
      cursor += height + (index < serviceStackCards.length - 1 ? gridGap : 0);
    });

    const finalCard = entries[entries.length - 1];
    serviceStackMetrics = {
      entries,
      gridBottom: gridTop + serviceStackGrid.offsetHeight,
      triggerY: finalCard.staticTop - finalCard.stickyTop,
      exitDuration: Math.max(viewportHeight * 1.3, 760),
      viewportHeight,
      stackTop
    };

    serviceStackGrid.style.setProperty('--service-stack-top', `${stackTop}px`);
    serviceStackGrid.style.transformOrigin = 'center top';
    entries.forEach((entry) => {
      entry.card.style.top = `${entry.stickyTop}px`;
      entry.card.style.zIndex = String(entry.index + 1);
    });
  };

  const activateServiceStack = () => {
    if (
      serviceStackActive ||
      !serviceStackMedia.matches ||
      reducedMotion ||
      !serviceStackGrid ||
      !serviceStackNext ||
      serviceStackCards.length !== 4
    ) return;

    serviceStackCards.sort((a, b) => {
      return Number.parseInt(window.getComputedStyle(a).order, 10) -
        Number.parseInt(window.getComputedStyle(b).order, 10);
    });
    serviceStackGrid.classList.add('service-stack-enabled');
    serviceStackNext.classList.add('service-stack-foreground');
    serviceStackActive = true;
    measureServiceStack();
  };

  const updateServiceStack = () => {
    serviceStackFrame = 0;
    if (!serviceStackMedia.matches || reducedMotion) {
      resetServiceStack();
      return;
    }
    activateServiceStack();
    if (!serviceStackActive || !serviceStackMetrics) return;

    const metrics = serviceStackMetrics;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const entranceDistance = Math.min(260, metrics.viewportHeight * 0.38);

    metrics.entries.forEach((entry) => {
      const naturalTop = entry.staticTop - scrollY;
      const parentBottom = metrics.gridBottom - scrollY;
      const constrainedTop = Math.min(
        Math.max(naturalTop, entry.stickyTop),
        parentBottom - entry.height
      );
      const entranceProgress = clampServiceProgress(
        (entry.stickyTop + entranceDistance - constrainedTop) / entranceDistance
      );
      // The card stays horizontally centred: only a short vertical settle is used.
      // Reverse sticky offsets place each newer card above the previous one by 10px.
      const y = (1 - entranceProgress) * 18;
      const scale = 0.992 + entranceProgress * 0.008;
      entry.card.style.transform =
        `perspective(1000px) translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    });

    if (scrollY >= metrics.triggerY) {
      const exitProgress = clampServiceProgress(
        (scrollY - metrics.triggerY) / metrics.exitDuration
      );
      const translateY = -18 * exitProgress;
      const rotateX = 9 * exitProgress;
      const scale = 1 - 0.055 * exitProgress;
      const panelRise = 84 * (1 - exitProgress);
      serviceStackGrid.style.transform =
        `perspective(1100px) translate3d(0, ${translateY.toFixed(2)}px, 0) ` +
        `rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      serviceStackNext.style.transform = `translate3d(0, ${panelRise.toFixed(2)}px, 0)`;
    } else {
      serviceStackGrid.style.removeProperty('transform');
      serviceStackNext.style.removeProperty('transform');
    }
  };

  const scheduleServiceStackUpdate = () => {
    if (!serviceStackMedia.matches || reducedMotion) {
      resetServiceStack();
      return;
    }
    if (!serviceStackFrame) {
      serviceStackFrame = window.requestAnimationFrame(updateServiceStack);
    }
  };

  if (serviceStackGrid && serviceStackNext && serviceStackCards.length === 4) {
    activateServiceStack();
    scheduleServiceStackUpdate();
    window.addEventListener('scroll', scheduleServiceStackUpdate, { passive: true });
    window.addEventListener('resize', () => {
      if (!serviceStackMedia.matches || reducedMotion) {
        resetServiceStack();
        return;
      }
      activateServiceStack();
      if (serviceStackActive) measureServiceStack();
      scheduleServiceStackUpdate();
    }, { passive: true });
  }

})();