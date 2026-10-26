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
    const menuLinks = Array.from(nav.querySelectorAll('a[href]'));
    const setMenuOpen = (open, restoreFocus = false) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      if (open) menuLinks[0]?.focus();
      else if (restoreFocus) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    menuLinks.forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        setMenuOpen(false, true);
        return;
      }
      if (event.key !== 'Tab' || menuLinks.length === 0) return;

      const firstLink = menuLinks[0];
      const lastLink = menuLinks[menuLinks.length - 1];
      const focusOutsideMenu = !nav.contains(document.activeElement) && document.activeElement !== menuButton;
      if (focusOutsideMenu || (event.shiftKey && (document.activeElement === firstLink || document.activeElement === menuButton))) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && (document.activeElement === lastLink || document.activeElement === menuButton)) {
        event.preventDefault();
        firstLink.focus();
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

  // Desktop/tablet-only scroll-progress motion for the four homepage service cards.
  // The phone layout is deliberately left to its existing responsive CSS.
  const serviceMotionMedia = window.matchMedia('(min-width: 761px)');
  const serviceMotionSection = document.querySelector('#services.services-section');
  const serviceMotionGrid = document.querySelector('#services .service-grid');
  const serviceMotionNext = document.querySelector('#skills');
  let serviceMotionCards = serviceMotionGrid
    ? Array.from(serviceMotionGrid.querySelectorAll('.service-card'))
    : [];
  let serviceMotionActive = false;
  let serviceMotionFrame = 0;
  let serviceMotionMetrics = null;

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

  const resetServiceCardMotion = () => {
    if (serviceMotionFrame) {
      window.cancelAnimationFrame(serviceMotionFrame);
      serviceMotionFrame = 0;
    }
    if (serviceMotionGrid) serviceMotionGrid.classList.remove('service-scroll-motion-enabled');
    if (serviceMotionSection) {
      serviceMotionSection.classList.remove('service-exit-motion-enabled');
      serviceMotionSection.style.removeProperty('transform');
      serviceMotionSection.style.removeProperty('transform-origin');
    }
    if (serviceMotionNext) {
      serviceMotionNext.classList.remove('service-foreground-enabled');
      serviceMotionNext.style.removeProperty('transform');
    }
    serviceMotionCards.forEach((card) => {
      card.style.removeProperty('opacity');
      card.style.removeProperty('transform');
      card.style.removeProperty('box-shadow');
    });
    serviceMotionActive = false;
    serviceMotionMetrics = null;
  };

  const sortServiceCardsForVisualOrder = () => {
    if (!serviceMotionGrid) return [];
    return Array.from(serviceMotionGrid.querySelectorAll('.service-card')).sort((a, b) => {
      const styleA = window.getComputedStyle(a);
      const styleB = window.getComputedStyle(b);
      const rowA = Number.parseInt(styleA.gridRowStart, 10) || 1;
      const rowB = Number.parseInt(styleB.gridRowStart, 10) || 1;
      const colA = Number.parseInt(styleA.gridColumnStart, 10) || 1;
      const colB = Number.parseInt(styleB.gridColumnStart, 10) || 1;
      return rowA - rowB || colA - colB;
    });
  };

  const measureServiceCardMotion = () => {
    if (!serviceMotionSection || !serviceMotionGrid || !serviceMotionNext) return;
    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    serviceMotionCards = sortServiceCardsForVisualOrder();

    const stagger = viewportHeight * 0.035;
    const travel = Math.max(viewportHeight * 0.42, 220);
    const entries = serviceMotionCards.map((card, index) => {
      const top = serviceDocumentTop(card);
      const start = top - viewportHeight * 0.84 + index * stagger;
      return { card, index, top, start, end: start + travel };
    });
    const finalEntry = entries.reduce((latest, entry) => entry.end > latest.end ? entry : latest, entries[0]);
    const sectionTop = serviceDocumentTop(serviceMotionSection);
    const sectionBottom = sectionTop + serviceMotionSection.offsetHeight;

    const exitDuration = Math.max(viewportHeight * 0.28, 180);
    serviceMotionMetrics = {
      entries,
      viewportHeight,
      // Start the section transition only after the last card has completed its entrance.
      exitStart: Math.max(sectionBottom - viewportHeight * 0.84, finalEntry.end + exitDuration),
      exitDuration
    };
  };

  const activateServiceCardMotion = () => {
    if (
      serviceMotionActive ||
      !serviceMotionMedia.matches ||
      reducedMotion ||
      !serviceMotionSection ||
      !serviceMotionGrid ||
      !serviceMotionNext ||
      serviceMotionCards.length !== 4
    ) return;

    serviceMotionGrid.classList.add('service-scroll-motion-enabled');
    serviceMotionSection.classList.add('service-exit-motion-enabled');
    serviceMotionNext.classList.add('service-foreground-enabled');
    serviceMotionActive = true;
    measureServiceCardMotion();
  };

  const updateServiceCardMotion = () => {
    serviceMotionFrame = 0;
    if (!serviceMotionMedia.matches || reducedMotion) {
      resetServiceCardMotion();
      return;
    }
    activateServiceCardMotion();
    if (!serviceMotionActive || !serviceMotionMetrics) return;

    const metrics = serviceMotionMetrics;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const sideDistance = Math.min(56, Math.max(24, (window.innerWidth || 1024) * 0.035));

    metrics.entries.forEach((entry) => {
      const progress = clampServiceProgress((scrollY - entry.start) / (entry.end - entry.start));
      const approach = 1 - progress;
      let x = 0;
      let y = 34 * approach;
      let z = -44 * approach;
      let rotateX = -4.5 * approach;
      let rotateY = 0;
      let rotateZ = 0;
      let scale = 0.94 + progress * 0.06;

      if (entry.index === 1) {
        x = -sideDistance * approach;
        y = 38 * approach;
        z = -36 * approach;
        rotateX = -2.8 * approach;
        rotateY = -8.5 * approach;
        rotateZ = -2.4 * approach;
        scale = 0.935 + progress * 0.065;
      } else if (entry.index === 2) {
        x = sideDistance * approach;
        y = 28 * approach;
        z = -32 * approach;
        rotateX = 2.2 * approach;
        rotateY = 7.5 * approach;
        rotateZ = 2.2 * approach;
        scale = 0.945 + progress * 0.055;
      } else if (entry.index === 3) {
        x = -sideDistance * 0.62 * approach;
        y = 43 * approach;
        z = -48 * approach;
        rotateX = -4.2 * approach;
        rotateY = -4.5 * approach;
        rotateZ = 3.2 * approach;
        scale = 0.925 + progress * 0.075;
      }

      entry.card.style.opacity = String(Math.min(1, progress * 1.12));
      if (progress < 1) {
        entry.card.style.transform =
          `perspective(1200px) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) ` +
          `rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        const shadowY = 5 + progress * 11;
        const shadowBlur = 14 + progress * 18;
        const shadowAlpha = 0.1 + progress * 0.12;
        entry.card.style.boxShadow =
          `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`;
      } else {
        entry.card.style.removeProperty('transform');
        entry.card.style.opacity = '1';
        entry.card.style.removeProperty('box-shadow');
      }
    });

    // Begin the panel rise just below the viewport, then finish the transition after
    // every card has settled. This avoids a visible jump when the section boundary is crossed.
    const exitTransitionStart = metrics.exitStart - metrics.exitDuration;
    const exitProgress = clampServiceProgress(
      (scrollY - exitTransitionStart) / metrics.exitDuration
    );
    if (scrollY >= exitTransitionStart) {
      const translateY = -16 * exitProgress;
      const rotateX = 7.5 * exitProgress;
      const scale = 1 - 0.045 * exitProgress;
      const panelRise = 76 * (1 - exitProgress);
      serviceMotionSection.style.transformOrigin = 'center bottom';
      serviceMotionSection.style.transform =
        `perspective(1200px) translate3d(0, ${translateY.toFixed(2)}px, 0) ` +
        `rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      serviceMotionNext.style.transform = `translate3d(0, ${panelRise.toFixed(2)}px, 0)`;
    } else {
      serviceMotionSection.style.removeProperty('transform');
      serviceMotionSection.style.removeProperty('transform-origin');
      serviceMotionNext.style.removeProperty('transform');
    }
  };

  const scheduleServiceCardMotion = () => {
    if (!serviceMotionMedia.matches || reducedMotion) {
      resetServiceCardMotion();
      return;
    }
    if (!serviceMotionFrame) {
      serviceMotionFrame = window.requestAnimationFrame(updateServiceCardMotion);
    }
  };

  if (serviceMotionSection && serviceMotionGrid && serviceMotionNext && serviceMotionCards.length === 4) {
    activateServiceCardMotion();
    scheduleServiceCardMotion();
    window.addEventListener('scroll', scheduleServiceCardMotion, { passive: true });
    window.addEventListener('resize', () => {
      if (!serviceMotionMedia.matches || reducedMotion) {
        resetServiceCardMotion();
        return;
      }
      activateServiceCardMotion();
      if (serviceMotionActive) measureServiceCardMotion();
      scheduleServiceCardMotion();
    }, { passive: true });
  }

  // Play the responsive process motion-graphic once when visible, then scroll to the four cards.
  // Reduced-motion visitors get a static first frame and retain normal manual scrolling.
  const processFilm = document.querySelector('#processFilm');
  const processList = document.querySelector('#process .process-list');
  const processFilmMedia = window.matchMedia('(min-width: 761px)');
  if (processFilm && processList && !reducedMotion && 'IntersectionObserver' in window) {
    let processFilmStarted = false;
    let processFilmFinished = false;
    const finishProcessFilm = () => {
      if (processFilmFinished) return;
      processFilmFinished = true;
      processFilm.classList.remove('is-playing');
      processFilm.classList.add('is-complete');
      if (processFilmMedia.matches) {
        processList.classList.add('is-preparing');
        processList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => {
          processList.classList.remove('is-preparing');
          processList.classList.add('is-staged');
        }, 420);
      } else {
        processList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const startProcessFilm = () => {
      if (processFilmStarted || processFilmFinished) return;
      processFilmStarted = true;
      if (processFilmMedia.matches) processList.classList.add('is-preparing');
      processFilm.classList.add('is-playing');
      const progress = processFilm.querySelector('.process-film-progress > i');
      if (progress) progress.addEventListener('animationend', event => {
        if (event.animationName === 'processFilmProgress') finishProcessFilm();
      }, { once: true });
      window.setTimeout(finishProcessFilm, 7600);
    };
    const filmObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          observer.unobserve(entry.target);
          startProcessFilm();
        }
      });
    }, { threshold: [0.3, 0.45] });
    filmObserver.observe(processFilm);
  }

})();