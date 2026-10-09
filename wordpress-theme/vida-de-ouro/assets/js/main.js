/* ===================================
   MAIN.JS — Vida de Ouro Jacareí (WordPress)
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Consentimento de cookies / LGPD ----
  const COOKIE_CONSENT_KEY = 'vida_ouro_cookie_consent';
  let cookieBanner = null;

  const privacyUrl = document.body.dataset.privacyUrl || '/politica-de-privacidade/#cookies';

  function readCookieConsent() {
    try { return localStorage.getItem(COOKIE_CONSENT_KEY); } catch (_) { return null; }
  }

  function applyCookieConsent(choice) {
    document.documentElement.dataset.cookieConsent = choice;
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: { choice } }));
  }

  function saveCookieConsent(choice) {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, choice); } catch (_) {}
    applyCookieConsent(choice);
    if (cookieBanner) {
      cookieBanner.classList.add('cookie-banner--closing');
      window.setTimeout(() => cookieBanner.remove(), 220);
    }
  }

  function showCookieBanner() {
    if (document.querySelector('.cookie-banner')) return;
    cookieBanner = document.createElement('section');
    cookieBanner.className = 'cookie-banner';
    cookieBanner.setAttribute('role', 'dialog');
    cookieBanner.setAttribute('aria-modal', 'false');
    cookieBanner.setAttribute('aria-labelledby', 'cookieBannerTitle');
    cookieBanner.innerHTML = `
      <div class="cookie-banner__content">
        <div class="cookie-banner__icon" aria-hidden="true">🍪</div>
        <div class="cookie-banner__text">
          <h2 id="cookieBannerTitle">Sua privacidade importa</h2>
          <p>Usamos recursos essenciais para o funcionamento e a segurança do site. Você pode aceitar ou recusar cookies opcionais. Saiba mais na <a href="${privacyUrl}">Política de Privacidade</a>.</p>
        </div>
        <div class="cookie-banner__actions">
          <button type="button" class="btn btn--cookie-secondary" data-cookie-choice="essential">Recusar opcionais</button>
          <button type="button" class="btn btn--primary" data-cookie-choice="accepted">Aceitar todos</button>
        </div>
      </div>`;
    document.body.appendChild(cookieBanner);
    cookieBanner.querySelectorAll('[data-cookie-choice]').forEach(button => {
      button.addEventListener('click', () => saveCookieConsent(button.dataset.cookieChoice));
    });
    window.requestAnimationFrame(() => cookieBanner.classList.add('cookie-banner--visible'));
  }

  const savedCookieConsent = readCookieConsent();
  if (savedCookieConsent === 'accepted' || savedCookieConsent === 'essential') {
    applyCookieConsent(savedCookieConsent);
  } else {
    showCookieBanner();
  }

  document.querySelectorAll('[data-manage-cookies]').forEach(button => {
    button.addEventListener('click', showCookieBanner);
  });

  // ---- Header scroll ----
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // ---- Hamburger menu ----
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    if (!nav.id) nav.id = 'nav';
    hamburger.setAttribute('aria-controls', nav.id);
    hamburger.setAttribute('aria-expanded', 'false');
    const closeMenu = () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menu');
    };

    hamburger.addEventListener('click', () => {
      const isOpen = !nav.classList.contains('open');
      hamburger.classList.toggle('open', isOpen);
      nav.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth > 1100 || !link.closest('.nav__item--dropdown')) closeMenu();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
    });
  }

  // ---- Mobile: dropdown toggle ----
  document.querySelectorAll('.nav__item--dropdown .nav__link').forEach(link => {
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', e => {
      if (window.innerWidth <= 1100) {
        e.preventDefault();
        const item = link.closest('.nav__item--dropdown');
        const isOpen = item.classList.toggle('open');
        link.setAttribute('aria-expanded', String(isOpen));
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) {
      document.body.classList.remove('menu-open');
      if (hamburger && nav) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menu');
        nav.classList.remove('open');
      }
      document.querySelectorAll('.nav__item--dropdown.open').forEach(item => {
        item.classList.remove('open');
        const link = item.querySelector('.nav__link');
        if (link) link.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // ---- Indicação da página atual no menu (WordPress: path-based) ----
  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.hash) return;
    try {
      const linkPath = new URL(link.href, location.href).pathname.replace(/\/$/, '') || '/';
      if (linkPath === currentPath) {
        link.classList.add('nav__link--active');
        link.setAttribute('aria-current', 'page');
      }
    } catch (_) {}
  });

  // ---- Tabs produtos ----
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('tab--active'));
      tabContents.forEach(c => c.classList.remove('tab-content--active'));
      tab.classList.add('tab--active');
      const content = document.getElementById('tab-' + target);
      if (content) content.classList.add('tab-content--active');
    });
  });

  // ---- Reviews slider ----
  const reviews = Array.from(document.querySelectorAll('.review'));
  const dotsContainer = document.getElementById('reviewDots');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');
  const perPage = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  let currentPage = 0;

  function totalPages() {
    return Math.ceil(reviews.length / perPage());
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === currentPage ? ' active' : '');
      dot.addEventListener('click', () => { currentPage = i; showPage(); });
      dotsContainer.appendChild(dot);
    }
  }

  function showPage() {
    const pp = perPage();
    const start = currentPage * pp;
    reviews.forEach((r, i) => {
      r.classList.toggle('visible', i >= start && i < start + pp);
    });
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentPage);
      });
    }
  }

  if (reviews.length) {
    buildDots();
    showPage();
    if (prevBtn) prevBtn.addEventListener('click', () => {
      currentPage = (currentPage - 1 + totalPages()) % totalPages();
      showPage();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      currentPage = (currentPage + 1) % totalPages();
      showPage();
    });
    window.addEventListener('resize', () => {
      currentPage = 0;
      buildDots();
      showPage();
    });
    setInterval(() => {
      currentPage = (currentPage + 1) % totalPages();
      showPage();
    }, 5000);
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__a');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq__item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__a').style.display = 'none';
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- Counter animation ----
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const isLarge = target > 999;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      if (isLarge) {
        el.textContent = '+' + Math.floor(current).toLocaleString('pt-BR');
      } else {
        el.textContent = Math.floor(current);
      }
    }, step);
  }

  const counterEls = document.querySelectorAll('.stat-card__value[data-count]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => observer.observe(el));
  }

  // ---- Form submit ----
  const form = document.getElementById('cotacaoForm');
  if (form) {
    function setFieldError(field, msg) {
      if (!field) return;
      const group = field.closest('.form__group') || field.parentElement;
      let err = group.querySelector('.form__error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'form__error';
        group.appendChild(err);
      }
      err.textContent = msg || '';
      field.classList.toggle('is-invalid', !!msg);
      if (msg) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function validPhone(tel) {
      const digits = tel.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 11;
    }

    ['nome', 'telefone', 'cidade', 'produto'].forEach(id => {
      const el = form.querySelector('#' + id);
      if (el) el.addEventListener('input', () => setFieldError(el, ''));
      if (el) el.addEventListener('change', () => setFieldError(el, ''));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const nomeEl    = form.querySelector('#nome');
      const telEl     = form.querySelector('#telefone');
      const cidadeEl  = form.querySelector('#cidade');
      const produtoEl = form.querySelector('#produto');
      if (!nomeEl || !telEl || !produtoEl) return;

      const nome    = nomeEl.value.trim();
      const tel     = telEl.value.trim();
      const cidade  = cidadeEl ? cidadeEl.value : '';
      const produto = produtoEl.value;

      let firstInvalid = null;
      const check = (el, cond, msg) => {
        setFieldError(el, cond ? '' : msg);
        if (!cond && !firstInvalid) firstInvalid = el;
      };

      check(nomeEl, nome.length >= 2, 'Informe seu nome completo.');
      check(telEl, tel && validPhone(tel), 'Informe um WhatsApp válido com DDD.');
      if (cidadeEl) check(cidadeEl, !!cidade, 'Selecione sua cidade.');
      check(produtoEl, !!produto, 'Selecione o produto desejado.');

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const email = form.querySelector('#email')?.value.trim() || '';
      const msg   = form.querySelector('#mensagem')?.value.trim() || '';

      // Tenta salvar no CRM; falha silenciosa caso a API não exista neste ambiente
      try {
        fetch('/wp-json/vdo/v1/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, telefone: tel, email, cidade, produto, mensagem: msg, origem: 'site' })
        }).catch(() => {});
      } catch (_) {}

      const text = encodeURIComponent(
        `Olá! Vim pelo site e gostaria de uma cotação.\n\n` +
        `*Nome:* ${nome}\n` +
        `*Cidade:* ${cidade}\n` +
        `*Produto:* ${produto}\n` +
        (msg ? `*Obs:* ${msg}` : '')
      );
      window.open(`https://wa.me/5512976002718?text=${text}`, '_blank');
      form.reset();
    });
  }

  // ---- Smooth scroll para âncoras internos ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
