(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      target?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'start'});
    });
    window.addEventListener('scroll', updateNext, {passive:true}); updateNext();
  }

  const form = document.querySelector('#savings-form');
  const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const get = id => Math.max(0, Number(document.querySelector('#'+id)?.value || 0));
  const resultValues = {annual:0, hours:0}, animationFrames = {};
  const animateNumber = (key, element, target, formatter) => {
    if (!element) return;
    if (animationFrames[key]) cancelAnimationFrame(animationFrames[key]);
    const start = resultValues[key] ?? 0; resultValues[key] = target;
    if (reducedMotion || start === target) { element.textContent = formatter(target); return; }
    const started = performance.now(), duration = 2400;
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
    const bills = get('bills-day') * get('work-days');
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
    form.querySelectorAll('input').forEach(input => input.addEventListener('change', () => calculate(true)));
    calculate(true);
  }
})();