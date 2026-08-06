/* Subtle generative particle / grid canvas for hero */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let mouse = { x: 0.5, y: 0.5 };
  let particles = [];
  let raf = 0;

  function resize() {
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.floor((width * height) / 14000);
    particles = Array.from({ length: Math.max(40, count) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      hue: Math.random() > 0.55 ? 185 : Math.random() > 0.5 ? 275 : 330,
    }));
  }

  function drawGrid() {
    const spacing = 48;
    const offsetX = (mouse.x - 0.5) * 28;
    const offsetY = (mouse.y - 0.5) * 28;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -spacing; x < width + spacing; x += spacing) {
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX + (mouse.y - 0.5) * 20, height);
    }
    for (let y = -spacing; y < height + spacing; y += spacing) {
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(width, y + offsetY + (mouse.x - 0.5) * 16);
    }
    ctx.stroke();
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    const mx = mouse.x * width;
    const my = mouse.y * height;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      p.vx += (dx / dist) * 0.004;
      p.vy += (dy / dist) * 0.004;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, 0.75)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 110) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - d / 110)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    mouse.y = (e.clientY - rect.top) / Math.max(rect.height, 1);
  });

  window.addEventListener('resize', resize);
  resize();
  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });
})();
