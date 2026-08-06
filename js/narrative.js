/* Narrative accordion + interactive choice outcomes */
(function () {
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const open = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach((el) => el.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  document.querySelectorAll('.choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      const outcome = card.querySelector('.outcome');
      if (!outcome) return;
      const parent = card.closest('.choice-grid');
      parent?.querySelectorAll('.outcome').forEach((o) => o.classList.remove('visible'));
      outcome.classList.add('visible');
    });
  });
})();
