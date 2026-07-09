(function () {
  const bottomLeft = document.querySelector('.bottom-left');
  if (!bottomLeft) return;

  const toggle = bottomLeft.querySelector('.nav-toggle');
  const nav = bottomLeft.querySelector('.pills');
  if (!toggle || !nav) return;

  const mql = window.matchMedia('(max-width: 470px)');

  function setExpanded(open) {
    bottomLeft.classList.toggle('is-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!mql.matches) return;
    setExpanded(!bottomLeft.classList.contains('is-nav-open'));
  });

  nav.querySelectorAll('.pill').forEach((link) => {
    link.addEventListener('click', () => setExpanded(false));
  });

  document.addEventListener('click', (event) => {
    if (!mql.matches || !bottomLeft.classList.contains('is-nav-open')) return;
    if (!bottomLeft.contains(event.target)) setExpanded(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setExpanded(false);
  });

  mql.addEventListener('change', () => setExpanded(false));
})();
