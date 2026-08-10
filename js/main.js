/* Shared navigation, contact form, and external-link warning helpers */
(function () {

  /* ── Nav toggle (mobile) ── */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  /* ── Contact form ── */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        if (note) note.textContent = 'All fields required to send transmission.';
        return;
      }

      const subject = encodeURIComponent(`Portfolio transmission from ${name}`);
      const body = encodeURIComponent(`${message}\n\n- ${name} <${email}>`);
      window.location.href = `mailto:efe.ayan@example.com?subject=${subject}&body=${body}`;
      if (note) note.textContent = 'Opening mail client… Replace email in about page when ready.';
      form.reset();
    });
  }

  /* ── Card detail toggles ── */
  document.querySelectorAll('[data-detail-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;
      const open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide details' : 'Details';
    });
  });

  /* ── External-link warning modal ──
     Any <a> or <button> with data-external-warn will trigger the modal.
     For <a> use href; for <button> use data-href.
  ── */
  const extWarn = document.getElementById('ext-warn');
  const extConfirm = document.getElementById('ext-warn-confirm');
  const extCancel = document.getElementById('ext-warn-cancel');
  if (extWarn && extConfirm && extCancel) {
    let pendingUrl = '';
    document.querySelectorAll('[data-external-warn]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        pendingUrl = el.getAttribute('href') || el.dataset.href || '';
        extWarn.hidden = false;
      });
    });
    extConfirm.addEventListener('click', () => {
      extWarn.hidden = true;
      if (pendingUrl) window.open(pendingUrl, '_blank', 'noopener');
      pendingUrl = '';
    });
    extCancel.addEventListener('click', () => {
      extWarn.hidden = true;
      pendingUrl = '';
    });
    extWarn.addEventListener('click', (e) => {
      if (e.target === extWarn) { extWarn.hidden = true; pendingUrl = ''; }
    });
  }

})();
