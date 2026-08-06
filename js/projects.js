/* Filterable project grid */
(function () {
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      cards.forEach((card) => {
        const cats = (card.getAttribute('data-category') || '').split(/\s+/);
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();
