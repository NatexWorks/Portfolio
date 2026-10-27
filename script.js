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

…[1 chars truncated — re-run with head/grep/tail for full output]…
sites, Custom web applications, and SEO.
  // This runs independently of the homepage stack; no rotations, only a restrained bottom/right settle.
  const servicesDetailList = document.querySelector('.service-detail-list');
  const servicesDetailCards = servicesDetailList
    ? Array.from(servicesDetailList.querySelectorAll(':scope > .service-detail')).slice(0, 3)
    : [];

  if (servicesDetailList && servicesDetailCards.length === 3 && window.matchMedia('(min-width: 761px)').matches && !reducedMotion) {
    let servicesDetailFrame = 0;
    let servicesDetailMetrics = [];
    servicesDetailList.classList.add('services-scroll-motion-enabled');

    const measureServicesDetailMotion = () => {
      const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
      const travel = Math.max(viewportHeight * 0.42, 220);
      servicesDetailMetrics = servicesDetailCards.map((card, index) => {
        const top = serviceDocumentTop(card);
        const start = top - viewportHeight * 0.84 + index * viewportHeight * 0.025;
        return { card, start, end: start + travel };
      });
    };

    const updateServicesDetailMotion = () => {
      servicesDetailFrame = 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      servicesDetailMetrics.forEach((entry) => {
        const progress = clampServiceProgress((scrollY - entry.start) / (entry.end - entry.start));
        const approach = 1 - progress;
        const x = 24 * approach;
        const y = 24 * approach;
        const z = -12 * approach;
        const scale = 0.985 + progress * 0.015;

        entry.card.style.opacity = String(progress);
        if (progress < 1) {
          entry.card.style.transform =
            `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) scale(${scale.toFixed(4)})`;
        } else {
          entry.card.style.removeProperty('transform');
          entry.card.style.opacity = '1';
        }
      });
    };

    const scheduleServicesDetailMotion = () => {
      if (servicesDetailFrame) return;
      servicesDetailFrame = window.requestAnimationFrame(updateServicesDetailMotion);
    };

    measureServicesDetailMotion();
    scheduleServicesDetailMotion();
    window.addEventListener('scroll', scheduleServicesDetailMotion, { passive: true });
    window.addEventListener('resize', () => {
      measureServicesDetailMotion();
      scheduleServicesDetailMotion();
    }, { passive: true });
  }

  // Services hero paragraph: reveal one word every 100ms (1.75x a 175ms/word baseline).
  const servicesHeroTypingTarget = document.querySelector('[data-services-hero-typewriter]');
  if (
    servicesHeroTypingTarget &&
    window.matchMedia('(min-width: 761px)').matches &&
    !reducedMotion &&
    'IntersectionObserver' in window
  ) {
    const fullText = servicesHeroTypingTarget.textContent.trim();
    const words = fullText.split(/\s+/);
    const wordNodes = [];
    servicesHeroTypingTarget.setAttribute('aria-label', fullText);
    servicesHeroTypingTarget.replaceChildren();

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word + (index < words.length - 1 ? ' ' : '');
      span.style.opacity = '0';
      span.setAttribute('aria-hidden', 'true');
      servicesHeroTypingTarget.appendChild(span);
      wordNodes.push(span);
    });

    let typingStarted = false;
    const beginWordTyping = () => {
      if (typingStarted) return;
      typingStarted = true;
      let index = 0;
      const showNextWord = () => {
        if (index >= wordNodes.length) return;
        wordNodes[index].style.opacity = '1';
        index += 1;
        if (index < wordNodes.length) window.setTimeout(showNextWord, 100);
      };
      showNextWord();
    };

    const servicesHeroTypingObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          beginWordTyping();
        }
      });
    }, { threshold: 0.12 });
    servicesHeroTypingObserver.observe(servicesHeroTypingTarget);
  }

  // Start the process motion-graphic when it enters view, then keep it looping.
  // Respect reduced-motion preferences and never force-scroll the visitor to the cards.
  const processFilm = document.querySelector('#processFilm');
  if (processFilm && !reducedMotion && 'IntersectionObserver' in window) {
    let processFilmStarted = false;
    const startProcessFilm = () => {
      if (processFilmStarted) return;
      processFilmStarted = true;
      processFilm.classList.remove('is-complete');
      processFilm.classList.add('is-playing');
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

  // Clicking a process step focuses that card and hides the other three.
  // Click it again or press Escape to restore the full list.
  const processList = document.querySelector('#process .process-list');
  if (processList) {
    const processSteps = Array.from(processList.querySelectorAll('[data-process-step]'));
    const clearFocusedProcessStep = (returnFocus = false) => {
      const focusedStep = processList.querySelector('.process-step.is-focused');
      processList.classList.remove('has-focused-step');
      processSteps.forEach(step => {
        step.classList.remove('is-focused');
        step.setAttribute('aria-pressed', 'false');
        const number = step.dataset.processStep;
        const title = step.querySelector('h3')?.textContent?.trim() || 'process step';
        step.setAttribute('aria-label', `Focus on process step ${number}: ${title}`);
      });
      if (returnFocus && focusedStep) focusedStep.focus({ preventScroll: true });
    };
    const focusProcessStep = (step) => {
      const isAlreadyFocused = step.classList.contains('is-focused');
      if (isAlreadyFocused) {
        clearFocusedProcessStep();
        step.setAttribute('aria-label', 'Focus on process step ' + step.dataset.processStep + ': ' + (step.querySelector('h3')?.textContent?.trim() || 'process step'));
        return;
      }
      processList.classList.add('has-focused-step');
      processSteps.forEach(item => {
        const selected = item === step;
        item.classList.toggle('is-focused', selected);
        item.setAttribute('aria-pressed', String(selected));
        const number = item.dataset.processStep;
        const title = item.querySelector('h3')?.textContent?.trim() || 'process step';
        item.setAttribute('aria-label', selected
          ? 'Show all process steps. Focused: ' + title
          : 'Focus on process step ' + number + ': ' + title);
      });
      step.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    };
    processSteps.forEach(step => {
      step.addEventListener('click', () => focusProcessStep(step));
      step.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          focusProcessStep(step);
        }
      });
    });
    processList.addEventListener('keydown', event => {
      if (event.key === 'Escape' && processList.classList.contains('has-focused-step')) {
        event.preventDefault();
        clearFocusedProcessStep(true);
      }
    });
  }


})();
/* Mobile-only behavior: accessible glass navigation and scroll-progress card reveals. */
(() => {
  const mobileQuery = window.matchMedia('(max-width:650px)');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  let previousOverflow = null;

  if (menuButton && nav) {
    const syncMenuState = () => {
      const open = nav.classList.contains('is-open');
      const shouldLock = open && mobileQuery.matches;
      document.body.classList.toggle('mobile-menu-open', shouldLock);
      if (shouldLock && previousOverflow === null) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if (!shouldLock && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
      menuButton.setAttribute('aria-expanded', String(open));
    };
    new MutationObserver(syncMenuState).observe(nav, { attributes:true, attributeFilter:['class'] });
    syncMenuState();
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMenuState);
    else if (mobileQuery.addListener) mobileQuery.addListener(syncMenuState);
  }

  if (!mobileQuery.matches || reduceQuery.matches) return;

  // Keep the process cards touch-responsive; numbers remain in accessible labels, not as decoration.
  document.querySelectorAll('#process .process-step, .process-film-scene').forEach((card) => {
    card.addEventListener('touchstart', () => card.classList.add('mobile-touch-active'), { passive:true });
    ['touchend','touchcancel','touchmove'].forEach((type) => {
      card.addEventListener(type, () => card.classList.remove('mobile-touch-active'), { passive:true });
    });
  });

  const wrapTextWords = (element, className, inlineBlock = false, hideFromAssistiveTech = true) => {
    if (!element || element.dataset[className]) return [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const wrapped = [];
    textNodes.forEach((node) => {
      const value = node.nodeValue || '';
      if (!value.trim()) return;
      const fragment = document.createDocumentFragment();
      value.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'mobile-reveal-word';
        if (hideFromAssistiveTech) span.setAttribute('aria-hidden', 'true');
        span.textContent = part;
        span.style.display = inlineBlock ? 'inline-block' : 'inline';
        span.style.opacity = '0';
        wrapped.push(span);
        fragment.appendChild(span);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    element.dataset[className] = 'true';
    return wrapped;
  };

  // Service headline: words arrive diagonally, while the heading keeps one accessible text label.
  const heroHeading = document.querySelector('.services-page-hero h1');
  if (heroHeading) {
    const label = heroHeading.innerText.replace(/\s+/g, ' ').replace(/\s+([.])/g, '$1').trim();
    heroHeading.setAttribute('aria-label', label);
    const wordSpans = wrapTextWords(heroHeading, 'mobileWordRevealDone', true);
    wordSpans.forEach((span, index) => {
      span.style.animation = `mobileWordReveal .42s ease-out ${Math.min(index * 45, 1400)}ms both`;
    });
  }

  // Visibility paragraph: reveal the rendered lines once, preserving the existing inline emphasis.
  const visibilityParagraph = document.querySelector('.service-principle > p');
  if (visibilityParagraph) {
    const words = wrapTextWords(visibilityParagraph, 'mobileLineRevealDone', false, false);
    const revealLines = () => {
      const lineTops = [];
      const wordLines = words.map((word) => {
        const top = Math.round(word.getBoundingClientRect().top / 2) * 2;
        let line = lineTops.findIndex((existingTop) => Math.abs(existingTop - top) <= 2);
        if (line < 0) { lineTops.push(top); line = lineTops.length - 1; }
        return line;
      });
      words.forEach((word, index) => {
        word.style.animation = `mobileLineReveal .55s ease-out ${wordLines[index] * 180}ms both`;
      });
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          currentObserver.unobserve(entry.target);
          window.requestAnimationFrame(revealLines);
        });
      }, { threshold:.18 });
      observer.observe(visibilityParagraph);
    } else {
      window.requestAnimationFrame(revealLines);
    }
  }

  // Four homepage service cards: scroll progress drives diagonal entrance and the next-section panel rise.
  const serviceSection = document.querySelector('#services.services-section');
  const serviceGrid = serviceSection?.querySelector('.service-grid');
  const serviceCards = serviceGrid ? Array.from(serviceGrid.querySelectorAll(':scope > .service-card')) : [];
  const nextSection = document.querySelector('#skills');
  if (!serviceSection || !serviceGrid || serviceCards.length !== 4 || !nextSection) return;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const documentTop = (element) => {
    let top = 0;
    let node = element;
    while (node && node !== document.body && node !== document.documentElement) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return top;
  };
  let metrics = null;
  let frame = 0;
  let enabled = true;
  const clearInlineMotion = () => {
    serviceSection.style.removeProperty('transform');
    serviceSection.style.removeProperty('transform-origin');
    nextSection.style.removeProperty('transform');
    serviceCards.forEach((card) => {
      card.style.removeProperty('opacity');
      card.style.removeProperty('transform');
      card.style.removeProperty('box-shadow');
    });
    serviceSection.classList.remove('service-exit-motion-enabled');
    nextSection.classList.remove('service-foreground-enabled');
    enabled = false;
  };
  const measure = () => {
    const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    const travel = Math.max(vh * .38, 180);
    const stagger = vh * .055;
    const entries = serviceCards.map((card, index) => {
      const start = documentTop(card) - vh * .82 + index * stagger;
      return { card, index, start, end:start + travel };
    });
    const sectionTop = documentTop(serviceSection);
    const sectionBottom = sectionTop + serviceSection.offsetHeight;
    const lastEnd = Math.max(...entries.map((entry) => entry.end));
    const exitDuration = Math.max(vh * .27, 160);
    metrics = {
      entries, vh, exitDuration,
      exitStart:Math.max(sectionBottom - vh * .82, lastEnd + exitDuration + vh * .28)
    };
  };
  const update = () => {
    frame = 0;
    if (!mobileQuery.matches || reduceQuery.matches) {
      clearInlineMotion();
      return;
    }
    if (!enabled) {
      enabled = true;
      serviceSection.classList.add('service-exit-motion-enabled');
      nextSection.classList.add('service-foreground-enabled');
      measure();
    }
    if (!metrics) measure();
    const y = window.scrollY || window.pageYOffset || 0;
    const side = Math.min(34, Math.max(18, window.innerWidth * .065));
    metrics.entries.forEach(({card,index,start,end}) => {
      const progress = clamp((y - start) / (end - start));
      const approach = 1 - progress;
      const direction = index % 2 === 0 ? -1 : 1;
      const x = direction * side * approach;
      const translateY = (30 + index * 3) * approach;
      const z = -15 * approach;
      const rotate = direction * 2.2 * approach;
      const scale = .975 + .025 * progress;
      card.style.opacity = String(.08 + .92 * progress);
      if (progress < 1) {
        card.style.transform = `perspective(1100px) translate3d(${x.toFixed(2)}px,${translateY.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.boxShadow = `0 ${(8 + progress * 9).toFixed(1)}px ${(22 + progress * 14).toFixed(1)}px rgba(0,0,0,${(.10 + progress * .08).toFixed(3)})`;
      } else {
        card.style.removeProperty('transform');
        card.style.opacity = '1';
        card.style.removeProperty('box-shadow');
      }
    });
    const transitionStart = metrics.exitStart - metrics.exitDuration;
    const progress = clamp((y - transitionStart) / metrics.exitDuration);
    if (y >= transitionStart) {
      serviceSection.style.transformOrigin = 'center bottom';
      serviceSection.style.transform = `perspective(1100px) translate3d(0,${(-12 * progress).toFixed(2)}px,0) rotateX(${(3.2 * progress).toFixed(2)}deg) scale(${(1 - .032 * progress).toFixed(4)})`;
      nextSection.style.transform = `translate3d(0,${(72 * (1 - progress)).toFixed(2)}px,0)`;
    } else {
      serviceSection.style.removeProperty('transform');
      serviceSection.style.removeProperty('transform-origin');
      nextSection.style.removeProperty('transform');
    }
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const syncMotionPreference = () => {
    if (!mobileQuery.matches || reduceQuery.matches) {
      clearInlineMotion();
      return;
    }
    enabled = true;
    metrics = null;
    schedule();
  };
  serviceSection.classList.add('service-exit-motion-enabled');
  nextSection.classList.add('service-foreground-enabled');
  measure();
  schedule();
  window.addEventListener('scroll', schedule, { passive:true });
  window.addEventListener('resize', () => { metrics = null; schedule(); }, { passive:true });
  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMotionPreference);
  else if (mobileQuery.addListener) mobileQuery.addListener(syncMotionPreference);
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', syncMotionPreference);
  else if (reduceQuery.addListener) reduceQuery.addListener(syncMotionPreference);
})();
