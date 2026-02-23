// main.js - controla loader, logo animado, menú y scroll suave
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.min.js";
import ScrollToPlugin from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollToPlugin.min.js";

gsap.registerPlugin(ScrollToPlugin);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Inicializa la animación del loader y muestra el contenido
 */
function initializeLoaderAnimation() {
  const loader = document.getElementById('loader');
  const loaderLogo = document.getElementById('logo');
  const headerLogo = document.getElementById('logo-top');
  const app = document.getElementById('app');
  const header = document.getElementById('site-header');

  if (!loader || !loaderLogo || !headerLogo) {
    // fallback simple
    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      if (app) app.style.visibility = 'visible';
      if (header) header.classList.add('visible');
      document.body.classList.remove('is-loading');
      playHeroEntranceMotion();
    }, 2500);
    return;
  }

  // Mantener la página en estado de "loading" (y avisar a lectores de pantalla)
  document.body.classList.add('is-loading');
  document.body.setAttribute('aria-busy', 'true');

  // Pequeña demora para que la animación de zoom del logo termine y podamos animarlo al header
  setTimeout(() => {
    // obtener posiciones
    const src = loaderLogo.getBoundingClientRect();
    const tgt = headerLogo.getBoundingClientRect();

    // preparar logo para animación en pantalla (posición fija)
    Object.assign(loaderLogo.style, {
      position: 'fixed',
      left: `${src.left}px`,
      top: `${src.top}px`,
      width: `${src.width}px`,
      height: `${src.height}px`,
      margin: '0',
      zIndex: 10000,
      transformOrigin: 'center center'
    });

    // ocultar el logo del header hasta que la animación termine
    headerLogo.style.opacity = '0';

    // calcular delta y escala
    const dx = tgt.left - src.left;
    const dy = tgt.top - src.top;
    const scale = tgt.width / src.width;

    // animar el logo hacia la esquina (posición del logo del header)
    gsap.to(loaderLogo, {
      x: dx,
      y: dy,
      scale: scale,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => {
        // mostrar logo del header (misma imagen reducida)
        headerLogo.style.opacity = '1';

        // pequeña pausa y luego ocultar overlay
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          delay: 0.12,
          ease: 'power2.out',
          onComplete: () => {
            loader.remove();
            // mostrar contenido principal y header
            if (app) app.style.visibility = 'visible';
            if (header) header.classList.add('visible');
            // quitar estado loading
            document.body.classList.remove('is-loading');
            document.body.removeAttribute('aria-busy');
            playHeroEntranceMotion();
          }
        });
      }
    });
  }, 1800); // coincide con la animación de zoom inicial
}

/**
 * Anima el logo del nav para hacer scroll suave a inicio
 */
function initializeLogoNavigation() {
  const logoNavLink = document.querySelector('.logo-nav-link');
  
  if (!logoNavLink) return;

  logoNavLink.addEventListener('click', (e) => {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: "#inicio",
      duration: 1,
      ease: "power2.inOut"
    });
  });
}

/**
 * Inicializa el menú hamburguesa para dispositivos móviles
 */
function initializeMobileMenu() {
  const btnMenu = document.getElementById("btnMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!btnMenu || !mobileMenu) return;

  // helper para alternar estado y aria
  const toggleMenu = (open) => {
    if (open === undefined) {
      open = !mobileMenu.classList.contains('open');
    }
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    btnMenu.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      // move focus into menu
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      // return focus to toggle button
      btnMenu.focus();
    }
  };

  // Toggle del menú al hacer clic en el botón
  btnMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // cerrar cuando se clickea fuera o se presiona Escape
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && e.target !== btnMenu) {
      toggleMenu(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  // Cerrar menú al hacer clic en un enlace y hacer scroll suave
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');

      toggleMenu(false);

      // Scroll suave
      setTimeout(() => {
        gsap.to(window, {
          scrollTo: targetId,
          duration: 1,
          ease: "power2.inOut"
        });
      }, 300);
    });
  });
}

/**
 * Inicializa scroll suave para navegación en escritorio
 */
function initializeDesktopNavigation() {
  const desktopLinks = document.querySelectorAll('.nav-link');
  
  desktopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      gsap.to(window, {
        scrollTo: targetId,
        duration: 1,
        ease: "power2.inOut"
      });
    });
  });
}

/**
 * Anima el header al hacer scroll
 */
function initializeHeaderScroll() {
  const header = document.getElementById('site-header');
  
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('shadow-xl', 'bg-[#A5BD8F]/98');
    } else {
      header.classList.remove('shadow-xl');
      header.classList.remove('bg-[#A5BD8F]/98');
    }
  }, { passive: true });
}

/**
 * Entrada principal del hero despues del loader
 */
function splitTextIntoWords(element) {
  if (!element) return [];
  if (element.dataset.wordsReady === 'true') {
    return Array.from(element.querySelectorAll('.word-split'));
  }

  const rawText = (element.textContent || '').trim();
  if (!rawText) return [];

  const words = rawText.split(/\s+/);
  const fragment = document.createDocumentFragment();
  const wordNodes = [];

  element.setAttribute('aria-label', rawText);

  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'word-split';
    span.textContent = word;
    span.setAttribute('aria-hidden', 'true');
    fragment.appendChild(span);
    wordNodes.push(span);

    if (index < words.length - 1) {
      fragment.appendChild(document.createTextNode(' '));
    }
  });

  element.textContent = '';
  element.appendChild(fragment);
  element.dataset.wordsReady = 'true';
  return wordNodes;
}

function playHeroEntranceMotion() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroCta = document.querySelector('.hero-cta');

  if (!heroTitle) return;

  const titleWords = splitTextIntoWords(heroTitle);
  const subtitleWords = splitTextIntoWords(heroSubtitle);

  if (prefersReducedMotion) {
    gsap.set([heroTitle, heroSubtitle, heroCta], { autoAlpha: 1, y: 0 });
    gsap.set([...titleWords, ...subtitleWords], { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(
    titleWords.length ? titleWords : heroTitle,
    { autoAlpha: 0, y: 36, filter: 'blur(6px)' },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.62,
      stagger: 0.045
    }
  );

  if (heroSubtitle && subtitleWords.length) {
    tl.fromTo(
      subtitleWords,
      { autoAlpha: 0, y: 20, filter: 'blur(4px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.42, stagger: 0.03 },
      '-=0.28'
    );
  } else if (heroSubtitle) {
    tl.fromTo(
      heroSubtitle,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5 },
      '-=0.32'
    );
  }

  if (heroCta) {
    tl.fromTo(heroCta,
      { autoAlpha: 0, y: 20, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45 },
      '-=0.2'
    );
  }
}

/**
 * Microinteracciones de botones y CTA con hover
 */
function initializeButtonMotion() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  const targets = document.querySelectorAll('.hero-cta, #servicios a[href="#contacto"], .whatsapp-btn, button[type="submit"]');

  targets.forEach((target) => {
    target.addEventListener('pointerenter', () => {
      gsap.to(target, {
        y: -3,
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true
      });
    });

    target.addEventListener('pointerleave', () => {
      gsap.to(target, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: true
      });
    });
  });
}

/**
 * Parallax suave del hero segun la posicion del cursor
 */
function initializeHeroPointerParallax() {
  const hero = document.getElementById('inicio');
  const heroBg = hero?.querySelector('.hero-bg');

  if (!hero || !heroBg) return;
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(heroBg, {
      x: x * 12,
      y: y * 12,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true
    });
  });

  hero.addEventListener('pointerleave', () => {
    gsap.to(heroBg, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: true
    });
  });
}

/**
 * Efecto tilt interactivo para tarjetas de contacto
 */
function initializeContactCardTilt() {
  const cards = document.querySelectorAll('.contact-card');
  if (!cards.length) return;
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotationY: x * 8,
        rotationX: -y * 7,
        y: -4,
        duration: 0.22,
        transformPerspective: 700,
        transformOrigin: 'center',
        ease: 'power2.out',
        overwrite: true
      });
    });

    card.addEventListener('pointerleave', () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true
      });
    });
  });
}

/**
 * Barra de progreso superior basada en scroll
 */
function initializeScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    gsap.to(progressBar, {
      scaleX: progress,
      duration: 0.12,
      ease: 'none',
      overwrite: true
    });
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

// Ejecución principal cuando el DOM esté listo
function initializeContactForm() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // si los campos son válidos (required+type) el navegador se encargará
    alert('Gracias por tu mensaje. Nos pondremos en contacto pronto.');
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeLoaderAnimation();
  initializeLogoNavigation();
  initializeMobileMenu();
  initializeDesktopNavigation();
  initializeHeaderScroll();
  initializeContactForm();
  initializeButtonMotion();
  initializeHeroPointerParallax();
  initializeContactCardTilt();
  initializeScrollProgress();
});

// Safety fallback: if for any reason `is-loading` permanece tras 4s, quitarlo para mostrar el contenido
setTimeout(() => {
  if (document.body.classList.contains('is-loading')) {
    console.warn('[Loader] Fallback: removing is-loading after timeout');
    document.body.classList.remove('is-loading');
    document.body.removeAttribute('aria-busy');
    const app = document.getElementById('app');
    if (app) app.style.visibility = 'visible';
    playHeroEntranceMotion();
  }
}, 4000);
