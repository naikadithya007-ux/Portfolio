/* Portfolio interactions: menu, theme, filters, copy, reveal, active navigation */
(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const menuButton = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navAnchors = [...document.querySelectorAll('.nav-links a')];
  const filters = [...document.querySelectorAll('.filter-btn')];
  const projects = [...document.querySelectorAll('.project-card')];
  const copyButton = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  let toastTimeout;

  // Apply a saved theme, otherwise keep the light-mode default.
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
  updateThemeButton();

  themeButton.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') !== 'dark';
    if (isDark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
    updateThemeButton();
  });

  function updateThemeButton() {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeButton.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // Mobile drawer: toggle and close on navigation or outside click.
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });
  navAnchors.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  function closeMenu() {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  }

  // Project category filtering, including accessible pressed states.
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    projects.forEach(project => {
      const show = filter === 'all' || project.dataset.category === filter;
      project.classList.toggle('is-hidden', !show);
    });
  }));

  // Copy email with fallback for browsers without Clipboard API access.
  copyButton.addEventListener('click', async () => {
    const email = document.getElementById('email-display').textContent.trim();
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else fallbackCopy(email);
      showToast('Email copied!');
    } catch (error) {
      fallbackCopy(email);
      showToast('Select and copy the email');
    }
  });
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text; textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed'; textarea.style.opacity = '0';
    document.body.appendChild(textarea); textarea.select();
    const copied = document.execCommand('copy'); textarea.remove();
    if (!copied) throw new Error('Clipboard copy unavailable');
  }
  function showToast(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Reveal content when it enters the viewport (no animation if unsupported).
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealElements.forEach(el => observer.observe(el));
  } else revealElements.forEach(el => el.classList.add('visible'));

  // Highlight nav link for the section currently in view.
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  // Footer year is always current.
  document.getElementById('year').textContent = new Date().getFullYear();
})();
