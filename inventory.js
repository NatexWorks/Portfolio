(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileLenisQuery = window.matchMedia('(max-width: 760px)');
  let lenisInstance = null;

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

  // Mobile-only scroll-progress motion for the four workflow cards and their following section.
  // The desktop/tablet layouts are not touched; the effect is initialized only at the mobile breakpoint.
  const workflowMobileQuery = window.matchMedia('(max-width: 650px)');
  let mobileWorkflowMotionInitialized = false;

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

    // Use a 33-degree path from each intended quadrant: Catalog upper-left,
    // Stock upper-right, Checkout lower-left, and Barcode lower-right.
    const entryAngle = 33 * Math.PI / 180;
    const entryDistance = 64;
    const entryXDistance = Math.round(Math.cos(entryAngle) * entryDistance);
    const entryYDistance = Math.round(Math.sin(entryAngle) * entryDistance);

    workflowCards.forEach((card, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const verticalSide = index < 2 ? -1 : 1;
      card.style.setProperty('--stack-index', String(index));
      card.dataset.workflowProgress = '0';
      card.style.setProperty('--entry-opacity', '0');
      card.style.setProperty('--entry-x', `${side * entryXDistance}px`);
      card.style.setProperty('--entry-y', `${verticalSide * entryYDistance}px`);
      card.style.setProperty('--entry-z', '0px');
      card.style.setProperty('--entry-rotate-x', `${verticalSide * 4}deg`);
      card.style.setProperty('--entry-rotate-y', `${side * 4}deg`);
      card.style.setProperty('--shadow-y', '10px');
      card.style.setProperty('--shadow-blur', '22px');
      card.style.setProperty('--card-glow', '0');
    });

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    let timelineStart = 0;
    let timelineEnd = 0;
    let framePending = false;

    const measureTimeline = () => {
      workflowSection.style.setProperty('--workflow-scale', '1');
      workflowSection.style.setProperty('--workflow-tilt', '0deg');
      workflowSection.style.setProperty('--workflow-rise', '0px');
      workflowSection.style.setProperty('--workflow-opacity', '1');
      nextSection.style.setProperty('--workflow-panel-shift', '0px');

      const viewportHeight = window.innerHeight || 1;
      const lastCard = workflowCards[workflowCards.length - 1];
      const lastProgress = Number(lastCard.dataset.workflowProgress || '0');
      const lastRect = lastCard.getBoundingClientRect();
      // Barcode enters from the lower-right, so undo its remaining vertical offset.
      const lastLayoutTop = lastRect.top - (1 - lastProgress) * entryYDistance;
      const lastStickyTop = 70;
      timelineStart = lastLayoutTop + window.scrollY - lastStickyTop;
      timelineEnd = timelineStart + Math.min(viewportHeight * 0.32, 260);
    };

    const update = () => {
      framePending = false;
      if (!workflowMobileQuery.matches) return;

      const viewportHeight = window.innerHeight || 1;
      workflowCards.forEach((card, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const verticalSide = index < 2 ? -1 : 1;
        const previousProgress = Number(card.dataset.workflowProgress || '0');
        const rect = card.getBoundingClientRect();
        const verticalOffset = verticalSide * entryYDistance;

        // Correct for the transform, then trigger the diagonal entry only 118px before its stack position.
        const layoutTop = rect.top - (1 - previousProgress) * verticalOffset;
        const targetTop = 70 + (workflowCards.length - index - 1) * 10;
        const entranceDistance = 118;
        const startTop = targetTop + entranceDistance;
        const progress = clamp((startTop - layoutTop) / entranceDistance, 0, 1);
        const remaining = 1 - progress;

        card.dataset.workflowProgress = progress.toFixed(4);
        card.style.setProperty('--entry-opacity', progress.toFixed(4));
        card.style.setProperty('--entry-x', `${side * remaining * entryXDistance}px`);
        card.style.setProperty('--entry-y', `${verticalSide * remaining * entryYDistance}px`);
        card.style.setProperty('--entry-z', `${progress * 8}px`);
        card.style.setProperty('--entry-rotate-x', `${verticalSide * remaining * 4}deg`);
        card.style.setProperty('--entry-rotate-y', `${side * remaining * 4}deg`);
        card.style.setProperty('--shadow-y', `${10 + progress * 10}px`);
        card.style.setProperty('--shadow-blur', `${22 + progress * 20}px`);
        card.style.setProperty('--card-glow', `${progress * 0.28}`);
      });

      // Begin the foreground-panel transition when the final card reaches its stack position.
      const rawProgress = clamp((window.scrollY - timelineStart) / Math.max(1, timelineEnd - timelineStart), 0, 1);
      const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      workflowSection.style.setProperty('--workflow-scale', String(1 - 0.035 * progress));
      workflowSection.style.setProperty('--workflow-tilt', `${-4.5 * progress}deg`);
      workflowSection.style.setProperty('--workflow-rise', `${-16 * progress}px`);
      workflowSection.style.setProperty('--workflow-opacity', String(1 - 0.1 * progress));
      nextSection.style.setProperty('--workflow-panel-shift', `${viewportHeight * 0.15 * (1 - progress)}px`);
    };

    const requestUpdate = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      measureTimeline();
      requestUpdate();
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    measureTimeline();
    update();
  };

  initMobileWorkflowMotion();
  if (typeof workflowMobileQuery.addEventListener === 'function') {
    workflowMobileQuery.addEventListener('change', event => {
      if (event.matches) initMobileWorkflowMotion();
    });
  }

})();