/* Shared navigation + contact form helpers */
(function () {
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
      const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
      window.location.href = `mailto:efe.ayan@example.com?subject=${subject}&body=${body}`;
      if (note) note.textContent = 'Opening mail client… Replace email in about page when ready.';
      form.reset();
    });
  }

  document.querySelectorAll('[data-detail-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;
      const open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide details' : 'Details';
    });
  });
})();
