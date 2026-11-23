const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

document.getElementById('year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const copyButton = document.getElementById('copyUpi');
const toast = document.getElementById('toast');
copyButton?.addEventListener('click', async () => {
  const upi = 'ananduaman1-1@oksbi';
  try {
    await navigator.clipboard.writeText(upi);
    toast.textContent = 'UPI ID copied';
  } catch {
    toast.textContent = upi;
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
});

// Subtle pointer parallax for the hero editor mockup.
const stage = document.querySelector('.editor-stage');
const windowCard = document.querySelector('.editor-window');
if (stage && windowCard && matchMedia('(pointer:fine)').matches) {
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    windowCard.style.transform = `rotateY(${-8 + x * 5}deg) rotateX(${3 - y * 4}deg)`;
  });
  stage.addEventListener('pointerleave', () => windowCard.style.transform = '');
}
