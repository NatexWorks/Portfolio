(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileLenisQuery = window.matchMedia('(max-width: 760px)');
  let lenisInstance = null;
  let workflowStepController = null;

  // Mobile-only Lenis scrolling; preserve native layout and leave desktop/tablet scroll unchanged.
  if (mobileLenisQuery.matches && !reducedMotion && typeof window.Lenis === 'function') {
    lenisInstance = new window.Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.7,
      lerp: 0.09,
      respectReducedMotion: true,
      stopInertiaOnNavigate: true
    });
  }

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  if (toggle && menu) {
    const menuLinks = Array.from(menu.querySelectorAll('a[href]'));
    const setMenuOpen = (open, restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.classList.toggle('is-open', open);
      if (open) menuLinks[0]?.focus();
      else if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menuLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

    document.addEventListener('keydown', event => {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        setMenuOpen(false, true);
        return;
      }
      if (event.key !== 'Tab' || menuLinks.length === 0) return;

      const firstLink = menuLinks[0];
      const lastLink = menuLinks[menuLinks.length - 1];
      const focusOutsideMenu = !menu.contains(document.activeElement) && document.activeElement !== toggle;
      if (focusOutsideMenu || (event.shiftKey && (document.activeElement === firstLink || document.activeElement === toggle))) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && (document.activeElement === lastLink || document.activeElement === toggle)) {
        event.preventDefault();
        firstLink.focus();
      }
    });
  }
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:'0px 0px -28px 0px'});
    document.querySelectorAll('.reveal,.reveal-left').forEach(el => observer.observe(el));
  }
  const typeTargets = [...document.querySelectorAll('[data-typewriter]')];
  if (typeTargets.length && !reducedMotion) typeTargets.forEach((target, index) => {
    const fullText = target.dataset.typewriter || target.textContent;
    target.textContent = '';
    target.classList.add('is-typing');
    window.setTimeout(() => {
      let position = 0;
      const typeNext = () => {
        position += 1;
        target.textContent = fullText.slice(0, position);
        if (position < fullText.length) window.setTimeout(typeNext, 64);
        else target.classList.remove('is-typing');
      };
      typeNext();
    }, index * 480 + 180);
  });

  // Type the workflow caveat when it enters view on mobile; keep it readable without motion.
  const workflowLiveNote = document.querySelector('.workflow-live-note[data-live-demo-text]');
  if (workflowLiveNote && mobileLenisQuery.matches && !reducedMotion && 'IntersectionObserver' in window) {
    const fullLiveNote = workflowLiveNote.dataset.liveDemoText || workflowLiveNote.textContent;
    workflowLiveNote.setAttribute('aria-label', fullLiveNote);
    // Reserve the exact final height only on mobile, keeping tablet/laptop layout untouched.
    const mobileWorkflowNoteQuery = window.matchMedia('(max-width: 650px)');
    const reserveWorkflowLiveNoteHeight = () => {
      const currentText = workflowLiveNote.textContent;
      workflowLiveNote.style.removeProperty('min-height');
      if (mobileWorkflowNoteQuery.matches) {
        workflowLiveNote.textContent = fullLiveNote;
        workflowLiveNote.style.minHeight = workflowLiveNote.getBoundingClientRect().height + 'px';
      }
      workflowLiveNote.textContent = currentText;
    };
    reserveWorkflowLiveNoteHeight();
    window.addEventListener('resize', reserveWorkflowLiveNoteHeight, { passive: true });
    workflowLiveNote.textContent = '';
    const liveNoteObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        let position = 0;
        workflowLiveNote.classList.add('is-typing');
        const typeNext = () => {
          position += 1;
          workflowLiveNote.textContent = fullLiveNote.slice(0, position);
          if (position < fullLiveNote.length) window.setTimeout(typeNext, 22);
          else workflowLiveNote.classList.remove('is-typing');
        };
        typeNext();
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -20px 0px' });
    liveNoteObserver.observe(workflowLiveNote);
  }

  // Type the headline, meet the two green strokes, then type the project copy in two speeds.
  const buildTypeTargets = [...document.querySelectorAll('[data-build-heading-type]')];
  const buildCopyTargets = [...document.querySelectorAll('[data-build-copy-type]')];
  const buildNote = document.querySelector('.build-note');
  if (buildNote && !reducedMotion) {
    buildNote.classList.add('is-build-sequence-running');
    [...buildTypeTargets, ...buildCopyTargets].forEach(target => { target.textContent = ''; });

    const typeTextTarget = (targets, targetIndex, onComplete) => {
      const target = targets[targetIndex];
      if (!target) { onComplete?.(); return; }

      const fullText = target.dataset.buildHeadingType || target.dataset.buildCopyType || '';
      const mode = target.dataset.buildMode || 'characters';
      const speed = Math.max(12, Number(target.dataset.buildSpeed) || 54);
      target.classList.add('is-typing');

      const finishTarget = () => {
        target.classList.remove('is-typing');
        window.setTimeout(() => typeTextTarget(targets, targetIndex + 1, onComplete), 150);
      };

      if (mode === 'words') {
        const words = fullText.split(/\s+/).filter(Boolean);
        const tailWordCount = Math.min(words.length, Math.max(0, Math.floor(Number(target.dataset.buildTailWords) || 0)));
        const tailSpeed = Math.max(speed, Number(target.dataset.buildTailSpeed) || speed);
        let wordIndex = 0;
        const typeWord = () => {
          target.textContent += (wordIndex ? ' ' : '') + words[wordIndex];
          wordIndex += 1;
          if (wordIndex < words.length) {
            let delay = speed;
            const tailStart = words.length - tailWordCount;
            if (tailWordCount > 0 && wordIndex >= tailStart) {
              const rampStep = wordIndex - tailStart + 1;
              delay = Math.round(speed + (tailSpeed - speed) * rampStep / tailWordCount);
            }
            window.setTimeout(typeWord, delay);
          } else finishTarget();
        };
        if (words.length) typeWord();
        else finishTarget();
      } else {
        let charIndex = 0;
        const typeCharacter = () => {
          charIndex += 1;
          target.textContent = fullText.slice(0, charIndex);
          if (charIndex < fullText.length) window.setTimeout(typeCharacter, speed);
          else finishTarget();
        };
        if (fullText.length) typeCharacter();
        else finishTarget();
      }
    };

    const startBuildSequence = () => typeTextTarget(buildTypeTargets, 0, () => {
      buildNote.classList.add('is-build-sequence-complete');
      window.setTimeout(() => {
        buildNote.classList.add('is-detail-revealed');
        window.setTimeout(() => {
          typeTextTarget(buildCopyTargets, 0, () => buildNote.classList.add('is-copy-complete'));
        }, 420);
      }, 1120);
    });

    if (buildTypeTargets.length && 'IntersectionObserver' in window) {
      const buildObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            window.setTimeout(startBuildSequence, 120);
          }
        });
      }, { threshold: .12 });
      buildObserver.observe(buildNote);
    } else if (buildTypeTargets.length) {
      startBuildSequence();
    }
  }

  const previewButtons = document.querySelectorAll('[data-preview]');
  const preview = document.querySelector('.app-content');
  const previewData = {
    overview: {title:'Inventory overview', labels:['Total products','Stock value','Low stock'], values:['1,284','₹4.82L','08'], heading:'Recent products', rows:[['Everyday tote','SKU-1024','In stock','124'],['Ceramic cup','SKU-1048','Low stock','08'],['Desk lamp','SKU-1102','In stock','56']], chart:'Stock movement'},
    products: {title:'Product catalogue', labels:['Active products','Categories','Low stock'], values:['1,284','10','08'], heading:'Product catalogue', rows:[['Everyday tote','SKU-1024','In stock','124'],['Ceramic cup','SKU-1048','Low stock','08'],['Desk lamp','SKU-1102','In stock','56']], chart:'Product activity'},
    billing: {title:'Billing overview', labels:['Bills today','Items sold','Stock alerts'], values:['080','246','08'], heading:'Recent sales', rows:[['Sale #2041','POS-2041','Complete','₹840'],['Sale #2040','POS-2040','Complete','₹560'],['Sale #2039','POS-2039','Review','₹320']], chart:'Sales activity'}
  };
  const renderPreview = key => {
    if (!preview || !previewData[key]) return;
    const data = previewData[key];
    preview.dataset.previewView = key;
    const title = preview.querySelector('.app-welcome h2');
    if (title) title.textContent = data.title;
    preview.querySelectorAll('.app-stats article').forEach((card, index) => {
      const label = card.querySelector('span'), value = card.querySelector('strong');
      if (label) label.textContent = data.labels[index];
      if (value) value.textContent = data.values[index];
    });
    const panelTitle = preview.querySelector('.table-panel .panel-heading b');
    if (panelTitle) panelTitle.textContent = data.heading;
    preview.querySelectorAll('.product-row').forEach((row, index) => {
      const rowData = data.rows[index];
      if (!rowData) return;
      const product = row.querySelector(':scope > span');
      if (product) {
        product.textContent = rowData[0];
        const sku = document.createElement('small'); sku.textContent = rowData[1]; product.append(sku);
      }
      const status = row.querySelector('.pill');
      if (status) { status.textContent = rowData[2]; status.className = 'pill ' + (rowData[2] === 'Low stock' || rowData[2] === 'Review' ? 'low' : 'good'); }
      const quantity = row.querySelector('strong');
      if (quantity) quantity.textContent = rowData[3];
    });
    const chartTitle = preview.querySelector('.chart-panel .panel-heading b');
    if (chartTitle) chartTitle.textContent = data.chart;
  };
  previewButtons.forEach(button => button.addEventListener('click', () => {
    previewButtons.forEach(dot => { const active = dot === button; dot.classList.toggle('is-active', active); dot.setAttribute('aria-pressed', String(active)); });
    renderPreview(button.dataset.preview);
  }));

  const nextButton = document.querySelector('.scroll-next');
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (nextButton) {
    const updateNext = () => {
      const currentY = window.scrollY + window.innerHeight * .35;
      const next = sections.find(section => section.offsetTop > currentY + 60) || document.querySelector('#overview');
      nextButton.dataset.target = '#' + next.id;
      nextButton.setAttribute('aria-label', next.id === 'overview' ? 'Back to top' : 'Scroll to next section');
      const label = nextButton.querySelector('span'), icon = nextButton.querySelector('b');
      if (label) label.textContent = next.id === 'overview' ? 'BACK TO TOP' : 'NEXT SECTION';
      if (icon) icon.textContent = next.id === 'overview' ? '↑' : '↓';
      nextButton.classList.toggle('is-back-top', next.id === 'overview');
      nextButton.title = next.id === 'overview' ? 'Back to top' : 'Scroll to next section';
    };
    nextButton.addEventListener('click', () => {
      if (workflowStepController && workflowStepController.isActive()) {
        workflowStepController.advance(1);
        return;
      }
      const target = document.querySelector(nextButton.dataset.target || '#problem');
      if (!target) return;
      if (lenisInstance) {
        lenisInstance.scrollTo(target, {
          duration: 1.05,
          easing: t => 1 - Math.pow(1 - t, 3)
        });
      } else {
        target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'start'});
      }
    });
    window.addEventListener('scroll', updateNext, {passive:true}); updateNext();
  }

  const form = document.querySelector('#savings-form');
  const workDaysInput = document.querySelector('#work-days');
  const daysCapWarning = document.querySelector('#days-cap-warning');
  let workDaysExceededCap = false;
  const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const get = id => Math.max(0, Number(document.querySelector('#'+id)?.value || 0));
  const resultValues = {annual:0, hours:0}, animationFrames = {};
  const animateNumber = (key, element, target, formatter) => {
    if (!element) return;
    if (animationFrames[key]) cancelAnimationFrame(animationFrames[key]);
    const start = resultValues[key] ?? 0; resultValues[key] = target;
    if (reducedMotion || start === target) { element.textContent = formatter(target); return; }
    const started = performance.now(), duration = window.matchMedia('(min-width: 951px)').matches ? 2400 : 850;
    const step = now => {
      const progress = Math.min(1, (now - started) / duration), eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatter(start + (target - start) * eased);
      if (progress < 1) animationFrames[key] = requestAnimationFrame(step);
      else { element.textContent = formatter(target); delete animationFrames[key]; }
    };
    animationFrames[key] = requestAnimationFrame(step);
  };
  const calculate = animate => {
    const annual = (get('current-cost') - get('custom-cost')) * 12;
    const workingDays = Math.min(31, get('work-days'));
    const bills = get('bills-day') * workingDays;
    if (daysCapWarning) daysCapWarning.hidden = !workDaysExceededCap;
    const secondsSaved = Math.max(0, get('current-seconds') - get('target-seconds'));
    const hours = bills * secondsSaved / 3600;
    const annualEl = document.querySelector('#annual-savings'), timeEl = document.querySelector('#time-saved');
    const annualFormatter = value => (value < 0 ? '−' : '') + money(Math.abs(Math.round(value)));
    const hoursFormatter = value => value.toLocaleString('en-IN',{maximumFractionDigits:1}) + ' hrs';
    if (animate) { animateNumber('annual', annualEl, annual, annualFormatter); animateNumber('hours', timeEl, hours, hoursFormatter); }
    else {
      resultValues.annual = annual; resultValues.hours = hours;
      if (annualEl) annualEl.textContent = annualFormatter(annual);
      if (timeEl) timeEl.textContent = hoursFormatter(hours);
    }
    const costCaption = document.querySelector('#cost-caption');
    if (costCaption) costCaption.textContent = annual >= 0 ? 'Potential difference over 12 months' : 'The SaaS cost entered is higher';
    const timeCaption = document.querySelector('#time-caption');
    if (timeCaption) timeCaption.textContent = secondsSaved ? 'Estimated monthly time saved if the target is achieved' : 'No time difference based on the entered values';
  };
  if (form) {
    form.addEventListener('submit', e => { e.preventDefault(); calculate(true); });
    let calculationTimer;
    if (workDaysInput) {
      workDaysInput.addEventListener('input', () => {
        const enteredDays = Number(workDaysInput.value);
        if (workDaysInput.value !== '' && enteredDays > 31) {
          workDaysExceededCap = true;
          workDaysInput.value = '31';
        } else {
          workDaysExceededCap = false;
        }
      });
    }
    form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
      window.clearTimeout(calculationTimer);
      calculationTimer = window.setTimeout(() => calculate(true), 120);
    }));
    calculate(true);
  }

  // Mobile-only scroll-progress workflow stack, matching the smooth service-card motion in index.html.
  // Native scrolling remains continuous; animation progress is derived from scroll position, not gesture counts.
  const workflowMobileQuery = window.matchMedia('(max-width: 650px)');
  let mobileWorkflowMotionInitialized = false;
  let teardownMobileWorkflowMotion = null;

  const initMobileWorkflowMotion = () => {
    if (mobileWorkflowMotionInitialized || !workflowMobileQuery.matches || reducedMotion) return;

    const workflowSection = document.querySelector('#workflows.workflows');
    const workflowGrid = workflowSection?.querySelector('.workflow-grid');
    const workflowCards = Array.from(workflowGrid?.querySelectorAll('.workflow-card') || []);
    const workflowLiveNote = workflowSection?.querySelector('.workflow-live-note');
    const nextSection = document.querySelector('#compare');

    if (!workflowSection || !workflowGrid || workflowCards.length !== 4 || !nextSection) return;

    mobileWorkflowMotionInitialized = true;
    document.documentElement.classList.add('mobile-workflow-motion');
    workflowGrid.classList.add('mobile-workflow-stack');
    nextSection.classList.add('workflow-stack-foreground');

    const clamp = value => Math.max(0, Math.min(1, value));
    const smoothstep = value => value * value * (3 - 2 * value);
    const documentTop = element => {
      let top = 0;
      let current = element;
      while (current && current !== document.body && current !== document.documentElement) {
        top += current.offsetTop || 0;
        current = current.offsetParent;
      }
      return top;
    };

    let metrics = null;
    let framePending = false;

    const measureWorkflowStack = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const stackTop = Math.max(70, Math.min(108, viewportHeight * 0.13));
      workflowGrid.style.setProperty('--workflow-stack-top', stackTop + 'px');
      workflowGrid.style.setProperty('--stack-note-tail-space', '0px');

      const gridTop = documentTop(workflowGrid);
      const gridStyles = window.getComputedStyle(workflowGrid);
      const gap = parseFloat(gridStyles.rowGap || gridStyles.gap || '0') || 0;
      const paddingTop = parseFloat(gridStyles.paddingTop) || 0;
      let cursor = gridTop + paddingTop;
      const entries = [];

      workflowCards.forEach((card, index) => {
        const styles = window.getComputedStyle(card);
        const height = card.offsetHeight || 220;
        const marginBottom = parseFloat(styles.marginBottom) || 0;
        const stickyTop = stackTop + (workflowCards.length - index - 1) * 10;
        entries.push({ card, index, staticTop: cursor, stickyTop, height });
        card.style.top = stickyTop + 'px';
        card.style.zIndex = String(index + 1);
        cursor += height + marginBottom + (index < workflowCards.length - 1 ? gap : 0);
      });

      const finalCard = entries[entries.length - 1];
      const triggerY = finalCard.staticTop - finalCard.stickyTop;
      const naturalNoteTop = workflowLiveNote ? documentTop(workflowLiveNote) : gridTop + workflowGrid.offsetHeight;
      const stackBottom = Math.max(...entries.map(entry => entry.stickyTop + entry.height));
      const desiredNoteTop = triggerY + stackBottom + 25;
      const tailSpace = Math.max(0, desiredNoteTop - naturalNoteTop);
      workflowGrid.style.setProperty('--stack-note-tail-space', tailSpace + 'px');

      metrics = {
        entries,
        gridBottom: gridTop + workflowGrid.offsetHeight,
        triggerY,
        exitDuration: Math.max(viewportHeight * 0.24, 140),
        viewportHeight
      };
    };

    const updateWorkflowStack = () => {
      framePending = false;
      if (!workflowMobileQuery.matches || !metrics) return;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const entranceDistance = Math.min(260, metrics.viewportHeight * 0.38);

      metrics.entries.forEach(entry => {
        const naturalTop = entry.staticTop - scrollY;
        const parentBottom = metrics.gridBottom - scrollY;
        const constrainedTop = Math.min(
          Math.max(naturalTop, entry.stickyTop),
          parentBottom - entry.height
        );
        const entranceProgress = clamp(
          (entry.stickyTop + entranceDistance - constrainedTop) / entranceDistance
        );
        const y = (1 - entranceProgress) * 18;
        const scale = 0.992 + entranceProgress * 0.008;

        // Match index.html: a small vertical settle and a restrained scale, tied directly to scrolling.
        entry.card.style.transform =
          'translate3d(0, ' + y.toFixed(2) + 'px, 0) scale(' + scale.toFixed(4) + ')';
      });

      if (scrollY >= metrics.triggerY) {
        const exitProgress = clamp((scrollY - metrics.triggerY) / metrics.exitDuration);
        const progress = smoothstep(exitProgress);
        workflowSection.style.setProperty('--workflow-rise', (-18 * progress).toFixed(2) + 'px');
        workflowSection.style.setProperty('--workflow-tilt', (2.5 * progress).toFixed(2) + 'deg');
        workflowSection.style.setProperty('--workflow-scale', (1 - 0.025 * progress).toFixed(4));
        workflowSection.style.setProperty('--workflow-opacity', '1');
        nextSection.style.setProperty('--workflow-panel-rise', (84 * (1 - progress)).toFixed(2) + 'px');
      } else {
        workflowSection.style.setProperty('--workflow-rise', '0px');
        workflowSection.style.setProperty('--workflow-tilt', '0deg');
        workflowSection.style.setProperty('--workflow-scale', '1');
        workflowSection.style.setProperty('--workflow-opacity', '1');
        nextSection.style.setProperty('--workflow-panel-rise', '0px');
      }
    };

    const requestWorkflowUpdate = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateWorkflowStack);
    };

    const handleResize = () => {
      measureWorkflowStack();
      requestWorkflowUpdate();
    };

    window.addEventListener('scroll', requestWorkflowUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    measureWorkflowStack();
    updateWorkflowStack();

    teardownMobileWorkflowMotion = () => {
      window.removeEventListener('scroll', requestWorkflowUpdate);
      window.removeEventListener('resize', handleResize);
      workflowSection.style.removeProperty('--workflow-scale');
      workflowSection.style.removeProperty('--workflow-tilt');
      workflowSection.style.removeProperty('--workflow-rise');
      workflowSection.style.removeProperty('--workflow-opacity');
      workflowGrid.style.removeProperty('--workflow-stack-top');
      workflowGrid.style.removeProperty('--stack-note-tail-space');
      nextSection.style.removeProperty('--workflow-panel-rise');
      workflowCards.forEach(card => {
        card.style.removeProperty('top');
        card.style.removeProperty('z-index');
        card.style.removeProperty('transform');
      });
      workflowGrid.classList.remove('mobile-workflow-stack');
      nextSection.classList.remove('workflow-stack-foreground');
      document.documentElement.classList.remove('mobile-workflow-motion');
      mobileWorkflowMotionInitialized = false;
      teardownMobileWorkflowMotion = null;
    };
  };

  initMobileWorkflowMotion();
  if (typeof workflowMobileQuery.addEventListener === 'function') {
    workflowMobileQuery.addEventListener('change', event => {
      if (event.matches) initMobileWorkflowMotion();
      else if (teardownMobileWorkflowMotion) teardownMobileWorkflowMotion();
    });
  }
})();