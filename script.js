/* Dronexis — Main JS */

document.getElementById('copyright-year').textContent = new Date().getFullYear();

// HERO VIDEO CROSSFADE
const heroVids = [document.getElementById('vid1'), document.getElementById('vid2')];

function crossfadeTo(next, prev) {
  heroVids[next].currentTime = 0;
  heroVids[next].play();
  heroVids[next].classList.add('active');
  heroVids[prev].classList.remove('active');
}

heroVids.forEach((video, i) => {
  video.addEventListener('timeupdate', () => {
    if (video._fading) return;
    const remaining = video.duration - video.currentTime;
    if (remaining > 0 && remaining <= 1.8) {
      video._fading = true;
      crossfadeTo(1 - i, i);
    }
  });
  video.addEventListener('ended', () => {
    video._fading = false;
  });
});

heroVids[0].play().catch(() => {});

// NAV: add scrolled class
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// MOBILE MENU
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.service-card, .portfolio-item, .channel, .contact-form, .contact-info'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// PORTFOLIO — carrega vídeos de videos.txt (um link do YouTube por linha)
const portfolioGrid = document.getElementById('portfolioGrid');

function extractYouTubeId(url) {
  try {
    return new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
}

function buildPortfolioItem(videoId) {
  const item = document.createElement('div');
  item.className = 'portfolio-item reveal';
  item.innerHTML = `
    <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="" loading="lazy">
    <div class="portfolio-overlay">
      <div class="play-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg></div>
    </div>
  `;
  item.addEventListener('click', () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener');
  });

  return item;
}

fetch('videos.txt')
  .then(res => {
    if (!res.ok) throw new Error('videos.txt não encontrado');
    return res.text();
  })
  .then(text => {
    const ids = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(extractYouTubeId)
      .filter(Boolean);

    portfolioGrid.innerHTML = '';
    if (ids.length === 0) {
      portfolioGrid.innerHTML = '<p class="portfolio-loading">Nenhum vídeo cadastrado ainda.</p>';
      return;
    }
    ids.forEach(id => {
      const el = buildPortfolioItem(id);
      portfolioGrid.appendChild(el);
      revealObserver.observe(el);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar videos.txt:', err);
    portfolioGrid.innerHTML = '<p class="portfolio-loading">Não foi possível carregar os vídeos.</p>';
  });

// PARTICLE CANVAS
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let animId;

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 10000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.4 + 0.1,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 212, 255, ${p.o})`;
    ctx.fill();
  });

  // Draw connections
  const maxDist = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 102, 255, ${0.12 * (1 - dist / maxDist)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animId = requestAnimationFrame(drawParticles);
}

const resizeObserver = new ResizeObserver(() => {
  resize();
  createParticles();
});
resizeObserver.observe(canvas.parentElement);
resize();
createParticles();
drawParticles();

// Pause animation when services section is off screen (performance)
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    if (!animId) drawParticles();
  } else {
    cancelAnimationFrame(animId);
    animId = null;
  }
});
heroObserver.observe(document.getElementById('servicos'));
