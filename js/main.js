/* ============================================================
   Precision Structures Inc. — Main JS
   ============================================================ */

// Scroll reveal
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 82, behavior: 'smooth' });
      }
    });
  });

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Contact form
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = document.getElementById('form-success');
      if (msg) {
        msg.style.display = 'block';
        form.reset();
        setTimeout(() => msg.style.display = 'none', 6000);
      }
    });
  }

  // Gallery filter
  document.querySelectorAll('.gallery-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      document.querySelectorAll('.gallery-item').forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Stat counter animation
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const num = parseInt(text);
        if (!isNaN(num) && num > 0 && num < 10000) {
          animateCounter(el, num, text);
        }
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));
});

function animateCounter(el, target, originalText) {
  const suffix = originalText.replace(/[\d,]/g, '');
  const prefix = originalText.match(/^[^\d]*/)[0];
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = originalText;
      clearInterval(interval);
    } else {
      el.textContent = prefix + current + suffix;
    }
  }, 30);
}

// Estimate calculator
function calculateEstimate() {
  const span = parseFloat(document.getElementById('est-span')?.value) || 0;
  const pitch = document.getElementById('est-pitch')?.value || '4/12';
  const qty = parseInt(document.getElementById('est-qty')?.value) || 1;
  const type = document.getElementById('est-type')?.value || 'roof';

  if (span <= 0 || qty <= 0) {
    alert('Please enter valid span and quantity values.');
    return;
  }

  // Base price per lineal foot (rough estimates)
  let basePerFoot = type === 'floor' ? 4.50 : 3.75;

  // Pitch multiplier
  const pitchMultipliers = {
    '2/12': 1.0, '3/12': 1.0, '4/12': 1.05, '5/12': 1.08,
    '6/12': 1.12, '7/12': 1.15, '8/12': 1.20, '9/12': 1.25,
    '10/12': 1.30, '12/12': 1.40
  };
  const pitchMult = pitchMultipliers[pitch] || 1.05;

  // Span complexity
  let spanMult = 1.0;
  if (span > 40) spanMult = 1.15;
  if (span > 60) spanMult = 1.35;

  const perTruss = span * basePerFoot * pitchMult * spanMult;
  const total = perTruss * qty;
  const low = Math.round(total * 0.85);
  const high = Math.round(total * 1.15);

  const result = document.getElementById('estimate-result');
  if (result) {
    result.style.display = 'block';
    result.querySelector('.est-value').textContent = '$' + low.toLocaleString() + ' — $' + high.toLocaleString();
    result.querySelector('.est-note').textContent =
      'Rough estimate for ' + qty + ' ' + type + ' truss' + (qty > 1 ? 'es' : '') +
      ' at ' + span + '\' span, ' + pitch + ' pitch. Contact us for an exact bid.';
  }
}
