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
  const form = document.querySelector('#savings-form');
  const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const get = id => Math.max(0, Number(document.querySelector('#'+id)?.value || 0));
  const calculate = e => {
    if (e) e.preventDefault();
    const monthlyDiff = get('current-cost') - get('custom-cost');
    const annual = monthlyDiff * 12;
    const bills = get('bills-day') * get('work-days');
    const secondsSaved = Math.max(0, get('current-seconds') - get('target-seconds'));
    const hours = bills * secondsSaved / 3600;
    document.querySelector('#annual-savings').textContent = (annual >= 0 ? '' : '−') + money(Math.abs(annual));
    document.querySelector('#cost-caption').textContent = annual >= 0 ? 'Potential difference over 12 months' : 'The proposed monthly amount is higher';
    document.querySelector('#time-saved').textContent = hours.toLocaleString('en-IN',{maximumFractionDigits:1}) + ' hrs';
    document.querySelector('#time-caption').textContent = secondsSaved ? 'Estimated monthly time saved if the target is achieved' : 'No time difference based on the entered values';
  };
  if (form) { form.addEventListener('submit', calculate); form.querySelectorAll('input').forEach(input => input.addEventListener('input', calculate)); calculate(); }
})();