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
    const closeMenu = () => { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); menu.classList.remove('is-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
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

  // Mobile-only, gesture-stepped scroll choreography for the four workflow cards.
  // A gesture can reveal only one card, regardless of swipe or wheel speed.
  const workflowMobileQuery = window.matchMedia('(max-width: 650px)');
  let mobileWorkflowMotionInitialized = false;
  let teardownMobileWorkflowMotion = null;

  const initMobileWorkflowMotion = () => {
    if (mobileWorkflowMotionInitialized || !workflowMobileQuery.matches || reducedMotion) return;

    const workflowSection = document.querySelector('#workflows.workflows');
    const workflowGrid = workflowSection?.querySelector('.workflow-grid');
    const workflowCards = Array.from(workflowGrid?.querySelectorAll('.workflow-card') || []);
    const nextSection = document.querySelector('#compare');

    if (!workflowSection || !workflowGrid || workflowCards.length !== 4 || !nextSection) return;

    mobileWorkflowMotionInitialized = true;
    document.documentElement.classList.add('mobile-workflow-motion');
    workflowGrid.classList.add('mobile-workflow-stack');

    const stickyTopOffsets = [100, 90, 80, 70];
    const entryYDistance = 64;
    const entranceDistance = 118;

    workflowCards.forEach((card, index) => {
      card.style.setProperty('--stack-index', String(index));
      card.dataset.workflowProgress = '0';
      card.style.setProperty('--entry-opacity', '0');
      card.style.setProperty('--entry-x', '0px');
      card.style.setProperty('--entry-y', '-' + entryYDistance + 'px');
      card.style.setProperty('--entry-z', '0px');
      card.style.setProperty('--entry-rotate-x', '0deg');
      card.style.setProperty('--entry-rotate-y', '0deg');
      card.style.setProperty('--shadow-y', '10px');
      card.style.setProperty('--shadow-blur', '22px');
      card.style.setProperty('--card-glow', '0');
    });

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    let timelineStart = 0;
    let timelineEnd = 0;
    let cardDocumentTops = [];
    let stageTargets = [];
    let gateStartY = 0;
    let framePending = false;
    let gateActive = false;
    let gateArmed = true;
    let workflowStage = -1;
    let stageAnimating = false;
    let lastObservedScroll = window.scrollY;
    let touchStart = null;
    let wheelGestureLocked = false;
    let wheelResetTimer = null;
    let activeAnimationFrame = 0;
    let scrollBehaviorRestore = null;

    const motionProperties = ['--workflow-scale', '--workflow-tilt', '--workflow-rise', '--workflow-opacity'];

    const syncLenisAt = (targetY) => {
      if (!lenisInstance) return;
      // Synchronize Lenis with the browser's position before parking it again.
      lenisInstance.start();
      lenisInstance.scrollTo(targetY, { immediate: true, force: true });
      lenisInstance.stop();
    };

    const setScrollImmediately = (targetY) => {
      if (lenisInstance) lenisInstance.stop();
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, targetY);
      root.style.scrollBehavior = previousBehavior;
      syncLenisAt(targetY);
    };

    const measureWorkflowStops = () => {
      // Neutralize the section transform while measuring document coordinates.
      const previousValues = motionProperties.map(property => workflowSection.style.getPropertyValue(property));
      workflowSection.style.setProperty('--workflow-scale', '1');
      workflowSection.style.setProperty('--workflow-tilt', '0deg');
      workflowSection.style.setProperty('--workflow-rise', '0px');
      workflowSection.style.setProperty('--workflow-opacity', '1');

      const gridDocumentTop = window.scrollY + workflowGrid.getBoundingClientRect().top;
      cardDocumentTops = workflowCards.map(card => gridDocumentTop + card.offsetTop);
      stageTargets = cardDocumentTops.map((documentTop, index) => Math.max(0, documentTop - stickyTopOffsets[index]));
      gateStartY = Math.max(0, stageTargets[0] - entranceDistance);
      timelineStart = stageTargets[3];
      timelineEnd = timelineStart + Math.min((window.innerHeight || 1) * 0.32, 260);

      motionProperties.forEach((property, index) => {
        if (previousValues[index]) workflowSection.style.setProperty(property, previousValues[index]);
        else workflowSection.style.removeProperty(property);
      });
    };

    const update = () => {
      framePending = false;
      if (!workflowMobileQuery.matches) return;

      const viewportHeight = window.innerHeight || 1;
      workflowCards.forEach((card, index) => {
        const previousProgress = Number(card.dataset.workflowProgress || '0');
        const rect = card.getBoundingClientRect();
        // Undo the card's previous transform to recover its layout position.
        const layoutTop = rect.top + (1 - previousProgress) * entryYDistance;
        const targetTop = stickyTopOffsets[index];
        const startTop = targetTop + entranceDistance;
        const rawProgress = clamp((startTop - layoutTop) / entranceDistance, 0, 1);
        // Ease the entrance so opacity, depth and shadows settle gently at the stack.
        const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
        const remaining = 1 - progress;

        card.dataset.workflowProgress = progress.toFixed(4);
        card.style.setProperty('--entry-opacity', progress.toFixed(4));
        card.style.setProperty('--entry-x', '0px');
        card.style.setProperty('--entry-y', (-remaining * entryYDistance) + 'px');
        card.style.setProperty('--entry-z', (progress * 8) + 'px');
        card.style.setProperty('--entry-rotate-x', '0deg');
        card.style.setProperty('--entry-rotate-y', '0deg');
        card.style.setProperty('--shadow-y', (10 + progress * 10) + 'px');
        card.style.setProperty('--shadow-blur', (22 + progress * 20) + 'px');
        card.style.setProperty('--card-glow', String(progress * 0.28));
      });

      // At card four's stop, keep the stack still. Exit motion starts only on another gesture.
      if (window.scrollY < timelineStart) {
        workflowSection.style.setProperty('--workflow-scale', '1');
        workflowSection.style.setProperty('--workflow-tilt', '0deg');
        workflowSection.style.setProperty('--workflow-rise', '0px');
        workflowSection.style.setProperty('--workflow-opacity', '1');
        nextSection.style.setProperty('--workflow-panel-shift', '0px');
        return;
      }

      const rawProgress = clamp((window.scrollY - timelineStart) / Math.max(1, timelineEnd - timelineStart), 0, 1);
      const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      workflowSection.style.setProperty('--workflow-scale', String(1 - 0.035 * progress));
      workflowSection.style.setProperty('--workflow-tilt', (-4.5 * progress) + 'deg');
      workflowSection.style.setProperty('--workflow-rise', (-16 * progress) + 'px');
      workflowSection.style.setProperty('--workflow-opacity', String(1 - 0.1 * progress));
      nextSection.style.setProperty('--workflow-panel-shift', (viewportHeight * 0.15 * (1 - progress)) + 'px');
    };

    const requestUpdate = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(update);
    };

    const animateScrollTo = (targetY, onComplete) => {
      stageAnimating = true;
      if (lenisInstance) lenisInstance.stop();

      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      scrollBehaviorRestore = previousBehavior;
      root.style.scrollBehavior = 'auto';
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = clamp(380 + Math.abs(distance) * 0.32, 420, 520);
      let startTime = 0;

      const step = (now) => {
        if (!startTime) startTime = now;
        const rawProgress = clamp((now - startTime) / duration, 0, 1);
        const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
        window.scrollTo(0, startY + distance * easedProgress);

        if (rawProgress < 1) {
          activeAnimationFrame = window.requestAnimationFrame(step);
          return;
        }

        activeAnimationFrame = 0;
        window.scrollTo(0, targetY);
        root.style.scrollBehavior = previousBehavior;
        scrollBehaviorRestore = null;
        syncLenisAt(targetY);
        stageAnimating = false;
        lastObservedScroll = window.scrollY;
        if (typeof onComplete === 'function') onComplete();
      };

      activeAnimationFrame = window.requestAnimationFrame(step);
    };

    const leaveWorkflowGate = (rearmWhenGoingBack) => {
      gateActive = false;
      workflowStage = -1;
      gateArmed = Boolean(rearmWhenGoingBack && window.scrollY < gateStartY - 24);
      if (lenisInstance) lenisInstance.start();
      lastObservedScroll = window.scrollY;
    };

    const advanceWorkflowStage = (direction) => {
      if (!gateActive || stageAnimating || workflowStage < 0) return;

      if (direction > 0) {
        if (workflowStage < 3) {
          const nextStage = workflowStage + 1;
          animateScrollTo(stageTargets[nextStage], () => {
            workflowStage = nextStage;
          });
          return;
        }

        // Fourth card is now parked. This next gesture runs the section-to-section handoff.
        animateScrollTo(timelineEnd, () => leaveWorkflowGate(false));
        return;
      }

      if (workflowStage > 0) {
        const previousStage = workflowStage - 1;
        animateScrollTo(stageTargets[previousStage], () => {
          workflowStage = previousStage;
        });
        return;
      }

      // Allow the user to leave the sequence upward without trapping them in the section.
      animateScrollTo(Math.max(0, gateStartY - 36), () => leaveWorkflowGate(true));
    };

    const activateWorkflowGate = () => {
      if (gateActive || !gateArmed || !workflowMobileQuery.matches) return;
      gateActive = true;
      gateArmed = false;
      workflowStage = -1;

      // Stop a fast flick at the start of card one's entrance, then animate card one in.
      setScrollImmediately(gateStartY);
      animateScrollTo(stageTargets[0], () => {
        workflowStage = 0;
      });
    };

    const handleWorkflowGateScroll = () => {
      const currentY = window.scrollY;
      if (!gateActive && !gateArmed && currentY < gateStartY - 24) gateArmed = true;
      const movingDown = currentY > lastObservedScroll + 1;
      lastObservedScroll = currentY;

      if (!gateActive && gateArmed && movingDown && currentY >= gateStartY) {
        activateWorkflowGate();
      }
    };

    const handleTouchStart = (event) => {
      if (!event.touches || event.touches.length !== 1) {
        touchStart = null;
        return;
      }
      const target = event.target;
      const interactive = target && typeof target.closest === 'function'
        ? target.closest('a, button, input, select, textarea, [contenteditable="true"]')
        : null;
      touchStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        canAdvance: gateActive && !stageAnimating && !interactive
      };
    };

    const handleTouchMove = (event) => {
      if (!gateActive || !touchStart || !event.touches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      // Native touch scrolling is suppressed only while the staged workflow owns the gesture.
      if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX) * 1.05) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleTouchEnd = (event) => {
      if (!touchStart) return;
      const start = touchStart;
      touchStart = null;
      if (!gateActive || !start.canAdvance || stageAnimating || !event.changedTouches || !event.changedTouches.length) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaY) < 28 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.05) return;
      advanceWorkflowStage(deltaY < 0 ? 1 : -1);
    };

    const handleTouchCancel = () => { touchStart = null; };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 2 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      if (gateActive) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!wheelGestureLocked) {
          wheelGestureLocked = true;
          if (!stageAnimating) advanceWorkflowStage(event.deltaY > 0 ? 1 : -1);
        }
      } else if (!wheelGestureLocked) {
        // Mark the wheel burst even before the gate, so one fast burst cannot enter and skip stages.
        wheelGestureLocked = true;
      }

      if (wheelResetTimer) window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelGestureLocked = false;
      }, 320);
    };

    const handleKeydown = (event) => {
      if (!gateActive) return;
      let direction = 0;
      if (['ArrowDown', 'PageDown', ' ' , 'Spacebar'].includes(event.key) || (event.key === 'Enter' && event.target === document.body)) direction = 1;
      else if (['ArrowUp', 'PageUp'].includes(event.key) || (event.shiftKey && event.key === ' ')) direction = -1;
      if (!direction) return;
      event.preventDefault();
      if (!event.repeat && !stageAnimating) advanceWorkflowStage(direction);
    };

    const handleResize = () => {
      measureWorkflowStops();
      if (gateActive && !stageAnimating && workflowStage >= 0) {
        setScrollImmediately(stageTargets[workflowStage]);
      }
      requestUpdate();
    };

    workflowStepController = {
      isActive: () => gateActive,
      advance: direction => advanceWorkflowStage(direction)
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('scroll', handleWorkflowGateScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true, capture: true });
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('keydown', handleKeydown, { capture: true });

    measureWorkflowStops();
    lastObservedScroll = window.scrollY;
    update();

    teardownMobileWorkflowMotion = () => {
      if (wheelResetTimer) window.clearTimeout(wheelResetTimer);
      if (activeAnimationFrame) window.cancelAnimationFrame(activeAnimationFrame);
      activeAnimationFrame = 0;
      if (scrollBehaviorRestore !== null) {
        document.documentElement.style.scrollBehavior = scrollBehaviorRestore;
        scrollBehaviorRestore = null;
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('scroll', handleWorkflowGateScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchmove', handleTouchMove, true);
      window.removeEventListener('touchend', handleTouchEnd, true);
      window.removeEventListener('touchcancel', handleTouchCancel, true);
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('keydown', handleKeydown, true);

      gateActive = false;
      gateArmed = true;
      stageAnimating = false;
      workflowStage = -1;
      touchStart = null;
      wheelGestureLocked = false;
      workflowSection.style.removeProperty('--workflow-scale');
      workflowSection.style.removeProperty('--workflow-tilt');
      workflowSection.style.removeProperty('--workflow-rise');
      workflowSection.style.removeProperty('--workflow-opacity');
      nextSection.style.removeProperty('--workflow-panel-shift');
      workflowCards.forEach(card => {
        [
          '--stack-index', '--entry-opacity', '--entry-x', '--entry-y', '--entry-z',
          '--entry-rotate-x', '--entry-rotate-y', '--shadow-y', '--shadow-blur', '--card-glow'
        ].forEach(property => card.style.removeProperty(property));
        delete card.dataset.workflowProgress;
      });
      workflowGrid.classList.remove('mobile-workflow-stack');
      document.documentElement.classList.remove('mobile-workflow-motion');
      workflowStepController = null;
      mobileWorkflowMotionInitialized = false;
      teardownMobileWorkflowMotion = null;
      if (lenisInstance) lenisInstance.start();
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