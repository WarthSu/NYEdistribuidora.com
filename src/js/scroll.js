// scroll.js - animaciones con GSAP + ScrollTrigger
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.min.js";
import ScrollTrigger from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.min.js";

// activa los mensajes y elementos de depuracion (set to true solo durante desarrollo)
const DEBUG = false;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

/**
 * Anima el texto del hero al hacer scroll
 */
function animateHeroOnScroll() {
  const heroTitle = document.querySelector('.hero-title');

  if (prefersReducedMotion && heroTitle) {
    gsap.set(heroTitle, { y: 0, opacity: 1 });
    return;
  }

  if (heroTitle) {
    gsap.to(heroTitle, {
      y: 40,
      opacity: 0.3,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: '+=400',
        scrub: 0.8
      }
    });
  }
}

/**
 * Anima las secciones al hacer scroll - Entrada suave
 */
function animateSectionsOnScroll() {
  const sections = document.querySelectorAll('section');

  if (prefersReducedMotion) {
    gsap.set(sections, { opacity: 1, y: 0 });
    return;
  }

  sections.forEach((section) => {
    // Skip sections that have image sequences (they use pin + their own animation)
    if (section.id === 'nosotros' || section.id === 'servicios' || section.id === 'contacto') return;
    gsap.fromTo(section,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none',
          markers: false
        }
      }
    );
  });
}

/**
 * Anima el contenido de texto en secciones
 */
function animateSectionContent() {
  const contentElements = document.querySelectorAll('.section-content');

  if (prefersReducedMotion) {
    gsap.set(contentElements, { opacity: 1, x: 0 });
    return;
  }

  contentElements.forEach((element) => {
    // Determina si la seccion es "nosotros" o "servicios" para la direccion de entrada
    const section = element.closest('section');
    const isNosotros = section && section.id === 'nosotros';
    const isServicios = section && section.id === 'servicios';
    
    // Establece la direccion de entrada
    const xFrom = isServicios ? 30 : -30; // Derecha para servicios, izquierda para nosotros
    
    gsap.fromTo(element,
      { opacity: 0, x: xFrom },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 75%',
          toggleActions: 'play reverse play none',
          markers: false
        }
      }
    );

    const textItems = element.querySelectorAll('p, li, a.inline-block');
    if (textItems.length) {
      gsap.set(textItems, { opacity: 1 });
      gsap.from(textItems, {
        opacity: 0,
        y: isServicios ? 16 : 22,
        duration: isServicios ? 0.45 : 0.6,
        stagger: isServicios ? 0.07 : 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 72%',
          toggleActions: 'play none none reverse'
        }
      });
    }

  });
}

/**
 * Entrada suave para encabezados de seccion
 */
function splitHeadingWords(element) {
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

function animateSectionHeadings() {
  const headings = document.querySelectorAll('section h2');

  if (prefersReducedMotion) {
    gsap.set(headings, { opacity: 1, y: 0 });
    return;
  }

  headings.forEach((heading) => {
    const words = splitHeadingWords(heading);
    const target = words.length ? words : heading;

    gsap.fromTo(target,
      { opacity: 0, y: 24, filter: 'blur(5px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 82%'
        }
      }
    );

  });
}

// Ejecutar animaciones cuando el DOM este listo
/**
 * Seccion de maquina de escribir (una sola vez al entrar en viewport)
 */
function initializeTypewriterSection() {
  const section = document.getElementById('mensaje-intro');
  const textEl = document.getElementById('typewriter-text');
  if (!section || !textEl) return;

  const firstText = '¿Tienes fruver, fruteria o restaurante en Bogotá y pierdes tiempo valioso yendo a la plaza a surtirte? ';
  const secondText = 'NOSOTROS LO HACEMOS POR TI';

  if (prefersReducedMotion) {
    textEl.textContent = secondText;
    section.classList.add('is-done');
    return;
  }

  let hasRun = false;

  const typeText = (value, speed) => new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      textEl.textContent = value.slice(0, i);
      i += 1;
      if (i <= value.length) {
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    };
    tick();
  });
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSequence = async () => {
    if (hasRun) return;
    hasRun = true;

    await typeText(firstText, 62);
    await pause(1000);
    textEl.textContent = '';
    await typeText(secondText, 52);
    section.classList.add('is-done');
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top 68%',
    once: true,
    onEnter: runSequence
  });
}
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (DEBUG) console.log('[Scroll] DOMContentLoaded - initializing scroll animations');
    animateHeroOnScroll();
    animateSectionsOnScroll();
    animateSectionContent();
    animateSectionHeadings();
    initializeTypewriterSection();
    animateContactCards();
    animateServiceChecklist();
    animateContactFormFields();
    animateWhatsAppButton();
    initializeActiveNavState();
    initializeHeaderBehavior();

    // Inicializar secuencias de imagen para 'nosotros' y 'servicios'
    if (DEBUG) console.log('[Scroll] initializing image sequences');
    setupImageSequence('nosotros', [
      'src/assets/Section1.jpg?v=2'
    ]);

    setupImageSequence('servicios', [
      'src/assets/Section2.jpg?v=2'
    ]);
  } catch (err) {
    console.error('[Scroll] error during initialization', err);
    // ensure header and content visible if something failed
    const app = document.getElementById('app');
    if (app) app.style.visibility = 'visible';
    document.body.classList.remove('is-loading');
  }
});


/**
 * Crea una secuencia de imagenes que se cambia segun el scroll (pin + scrub)
 * @param {string} sectionId Id de la seccion (ej. 'nosotros')
 * @param {string[]} imagePaths Array con rutas relativas a las imagenes
 */
function setupImageSequence(sectionId, imagePaths) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const container = section.querySelector(`#${sectionId}-sequence`);
  if (!container) return;

  // log de la imagen de reserva para diagnosticar problemas de carga
  const fallbackImg = container.querySelector('.seq-fallback');
  if (fallbackImg) {
    fallbackImg.addEventListener('load', () => {
      if (DEBUG) console.log('[ImageSeq] fallback loaded for', sectionId);
    });
    fallbackImg.addEventListener('error', () => {
      console.error('[ImageSeq] fallback failed for', sectionId, fallbackImg.src);
    });
  }

  // limpiar contenedor si ya tiene imagenes (pero conservar fallback estatico)
  const existingFallback = container.querySelector('.seq-fallback');
  container.innerHTML = '';
  if (existingFallback) container.appendChild(existingFallback);

  // si estamos en modo debug, creamos indicadores visibles
  let placeholder, status;
  if (DEBUG) {
    placeholder = document.createElement('div');
    placeholder.className = 'seq-placeholder';
    placeholder.textContent = 'Cargando imagenes...';
    placeholder.style.position = 'absolute';
    placeholder.style.inset = '0';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = 'rgba(0,0,0,0.45)';
    placeholder.style.fontSize = '0.95rem';
    placeholder.style.zIndex = '2';
    container.appendChild(placeholder);

    status = document.createElement('div');
    status.className = 'seq-status';
    status.style.position = 'absolute';
    status.style.right = '8px';
    status.style.top = '8px';
    status.style.padding = '6px 8px';
    status.style.background = 'rgba(255,255,255,0.9)';
    status.style.color = '#062f17';
    status.style.fontSize = '0.75rem';
    status.style.borderRadius = '6px';
    status.style.zIndex = '3';
    status.textContent = '0 / 0';
    container.appendChild(status);
  }

  // helper: normalizar rutas para que sean absolutas desde la raiz
  const normalizePath = (p) => {
    if (!p) return p;
    // leave full URLs intact
    if (p.startsWith('http')) return p;
    // convert absolute paths to relative when viewing via file://
    if (p.startsWith('/')) {
      if (window.location.protocol === 'file:') {
        return p.replace(/^\/+/, ''); // remove leading slashes
      }
      return p;
    }
    return p.replace(/^\.\//, '/');
  };

  // crear elementos img para cada ruta
  let appended = 0;
  let loaded = 0;
  const imgs = imagePaths.map((src, i) => {
    const normalized = normalizePath(src);
    const img = document.createElement('img');
    img.src = normalized;
    img.alt = '';
    img.loading = 'lazy';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'image-sequence-img';
    img.style.opacity = '0';
    img.style.position = 'absolute';
    img.style.inset = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';
    img.style.zIndex = '1';

    // Add basic load/error handlers for debugging
    img.addEventListener('load', () => {
      if (DEBUG) console.log('[ImageSeq] loaded', src);
      container.style.outline = 'none';
      loaded += 1;
      if (status) status.textContent = `${loaded} / ${appended}`;
      // remove placeholder and backgroundImage fallback on first load
      if (loaded === 1) {
        if (placeholder && placeholder.parentElement) placeholder.parentElement.removeChild(placeholder);
        if (container.style.backgroundImage) container.style.backgroundImage = '';
        // debug: log computed style y bounds of first loaded image
        try {
          if (DEBUG) {
            const cs = getComputedStyle(img);
            console.log('[ImageSeq] first image computed style', {display: cs.display, visibility: cs.visibility, opacity: cs.opacity, zIndex: cs.zIndex});
            console.log('[ImageSeq] container bounds', container.getBoundingClientRect());
          }
        } catch (e) {
          if (DEBUG) console.warn("[ImageSeq] couldn't get computed style", e);
        }
      }
    });
    img.addEventListener('error', (e) => {
      console.error('[ImageSeq] failed to load', src, e);
      img.style.opacity = '0';
      // show a tiny fallback background color if none of the images load
      container.style.background = container.style.background || '#f3f4f6';
    });

    container.appendChild(img);
    appended += 1;
    if (status) status.textContent = `${loaded} / ${appended}`;
    if (DEBUG) console.log('[ImageSeq] appended', img.src, 'to', container.id);

    return img;
  });

  // mostrar la primera imagen y asegurar visibilidad (clase activa + z-index superior)
  if (imgs[0]) {
    imgs[0].style.opacity = '1';
    imgs[0].classList.add('active');
    imgs[0].style.zIndex = '999';
    imgs[0].style.pointerEvents = 'none';
  }

  // estado visual inicial para la secuencia
  imgs.forEach((img, i) => {
    img.style.opacity = i === 0 ? '1' : '0';
    img.style.filter = 'none';
    img.style.transform = 'translate3d(0, 0, 0) scale(1)';
    img.style.clipPath = i === 0
      ? 'inset(0% 0% 0% 0% round 12px)'
      : 'inset(8% 3% 8% 3% round 12px)';
    img.style.willChange = 'opacity, transform, clip-path';
  });

  // Ajustes para una transicion mas rapida y sutil

  // Asegurar que el contenedor tenga posicion relativa y sea visible
  container.style.position = container.style.position || 'relative';
  container.style.zIndex = container.style.zIndex || '20';
  // Garantia de altura minima por si algun reset CSS colapsa el elemento
  container.style.minHeight = container.style.minHeight || '12rem';
  // ligera marca para debugging visual (se puede remover luego)
  container.style.outline = container.style.outline || '2px solid rgba(0,0,0,0.06)';
  // Fallback visual inmediato: usar la primera imagen como background por si los <img> no se muestran
  if (imagePaths[0]) {
    container.style.backgroundImage = `url(${normalizePath(imagePaths[0])})`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
  }
  if (DEBUG) console.log('[ImageSeq] initialized for', sectionId, 'images:', imagePaths);

  // definir referencia a la grilla antes de cualquier log que la use
  const gridEl = section.querySelector('.grid');

  // Debug: log computed style y bounds (solo si esta activado)
  if (DEBUG) {
    try {
      const cs = getComputedStyle(container);
      console.log('[ImageSeq] container computed style', { display: cs.display, position: cs.position, minHeight: cs.minHeight, zIndex: cs.zIndex });
      if (gridEl) console.log('[ImageSeq] grid bounds', gridEl.getBoundingClientRect());
    } catch (e) {
      console.warn('[ImageSeq] debug info unavailable', e);
    }
  }

  // Si ninguna imagen carga en 2s, mostrar fallback embebido y mensaje de error en status
  setTimeout(() => {
    if (loaded === 0) {
      console.warn('[ImageSeq] ninguna imagen cargo para', sectionId);
      if (status) status.textContent = 'Error: no se cargaron imagenes';
      // usar un placeholder embebido (data URI, pequena imagen) para asegurar visibilidad
      const dataSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#e6e6e6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#707070" font-size="20">Imagen no disponible</text></svg>');
      container.style.backgroundImage = `url(${dataSvg})`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      // ademas inyectar un <img> con la misma dataURI para asegurar visibilidad en todos los navegadores
      const fallbackImg = document.createElement('img');
      fallbackImg.src = dataSvg;
      fallbackImg.alt = 'Placeholder';
      fallbackImg.style.position = 'absolute';
      fallbackImg.style.inset = '0';
      fallbackImg.style.width = '100%';
      fallbackImg.style.height = '100%';
      fallbackImg.style.objectFit = 'cover';
      fallbackImg.style.opacity = '1';
      fallbackImg.style.zIndex = '999';
      container.appendChild(fallbackImg);
      // quitar placeholder si por alguna razon quedo
      if (placeholder && placeholder.parentElement) placeholder.parentElement.removeChild(placeholder);
    }
  }, 2000);

  // gridEl ya fue calculado mas arriba, solo validamos
  if (!gridEl) return;

  // ensure container and imgs are above other elements
  container.style.zIndex = container.style.zIndex || '20';
  imgs.forEach((img, idx) => { img.style.zIndex = idx === 0 ? '999' : '21'; });

  if (prefersReducedMotion) return;
  if (imagePaths.length <= 1) {
    setupSingleImageMotion(section, container, imgs[0], sectionId);
    return;
  }

  ScrollTrigger.create({
    trigger: container,
    start: 'top 80%',
    end: `+=${imagePaths.length * 380}`,
    scrub: true,
    // no pinning: el contenedor se desplaza normalmente y conserva altura fija
    markers: false,
    onUpdate(self) {
      const floatIdx = self.progress * (imagePaths.length - 1);
      // debug: report progress and index (useful in console if images don't change)
      if (DEBUG) console.log('[ImageSeq] update', sectionId, 'progress', self.progress.toFixed(3), 'floatIdx', floatIdx.toFixed(3));

      imgs.forEach((img, i) => {
        const signedDist = i - floatIdx;
        const dist = Math.abs(signedDist);
        const presence = gsap.utils.clamp(0, 1, 1 - dist);
        const opacity = Math.pow(presence, 1.5);
        // mantener escala 1 para preservar nitidez de las imagenes
        const scale = 1;
        const y = gsap.utils.clamp(-18, 18, signedDist * 14);
        const x = gsap.utils.clamp(-10, 10, signedDist * 8);
        const clipInset = gsap.utils.clamp(0, 8, dist * 8);
        const dynamicZ = Math.max(20, Math.round((1 - dist) * 100) + 20);

        img.style.zIndex = String(dynamicZ);

        gsap.to(img, {
          opacity,
          filter: 'none',
          scale,
          x,
          y,
          clipPath: `inset(${clipInset}% ${clipInset * 0.35}% ${clipInset}% ${clipInset * 0.35}% round 12px)`,
          duration: 0.26,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    },
    // no actions onLeave/EnterBack required when no pinning
  });
}

/**
 * Animacion premium para secciones con una sola imagen
 */
function setupSingleImageMotion(section, container, img, sectionId) {
  if (!section || !container || !img) return;

  gsap.set(img, {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    filter: 'none',
    clipPath: 'inset(8% 3% 8% 3% round 12px)'
  });

  gsap.to(img, {
    clipPath: 'inset(0% 0% 0% 0% round 12px)',
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: container,
      start: 'top 82%',
      toggleActions: 'play none none reverse'
    }
  });

  gsap.to(img, {
    yPercent: sectionId === 'servicios' ? -6 : -4,
    xPercent: sectionId === 'servicios' ? -1.5 : 1.5,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.fromTo(container,
    { boxShadow: '0 10px 24px rgba(0,0,0,0.16)' },
    {
      boxShadow: '0 24px 48px rgba(0,0,0,0.24)',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 35%',
        scrub: true
      }
    }
  );
}


/**
 * Anima tarjetas y formulario de contacto con stagger
 */
function animateContactCards() {
  const cards = document.querySelectorAll('#contacto .contact-card');
  const formShell = document.querySelector('#contacto .contact-form-shell');

  if (prefersReducedMotion) {
    gsap.set(cards, { opacity: 1, y: 0 });
    if (formShell) gsap.set(formShell, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  if (cards.length) {
    gsap.set(cards, { opacity: 1 });
    gsap.from(cards, {
      y: 28,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#contacto',
        start: 'top 70%'
      }
    });
  }

  if (formShell) {
    gsap.set(formShell, { opacity: 1 });
    gsap.from(formShell, {
      y: 26,
      scale: 0.98,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: formShell,
        start: 'top 78%'
      }
    });
  }
}

/**
 * Anima items de la lista de servicios con stagger
 */
function animateServiceChecklist() {
  const items = document.querySelectorAll('#servicios ul li');
  if (!items.length) return;

  if (prefersReducedMotion) {
    gsap.set(items, { opacity: 1, x: 0, y: 0 });
    return;
  }

  gsap.set(items, { opacity: 1 });
  gsap.from(items, {
    x: -18,
    y: 8,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#servicios',
      start: 'top 68%'
    }
  });
}

/**
 * Entrada escalonada de campos del formulario de contacto
 */
function animateContactFormFields() {
  const fields = document.querySelectorAll('#contacto form input, #contacto form textarea, #contacto form button');
  if (!fields.length) return;

  if (prefersReducedMotion) {
    gsap.set(fields, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  gsap.set(fields, { opacity: 1 });
  gsap.from(fields, {
    y: 14,
    scale: 0.985,
    duration: 0.4,
    stagger: 0.07,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#contacto form',
      start: 'top 80%'
    }
  });
}

/**
 * Flotacion sutil del boton de WhatsApp
 */
function animateWhatsAppButton() {
  const button = document.querySelector('.whatsapp-btn');
  if (!button || prefersReducedMotion) return;

  gsap.to(button, {
    y: -7,
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
}

/**
 * Estado activo de enlaces de navegacion segun seccion visible
 */
function initializeActiveNavState() {
  const sections = [...document.querySelectorAll('section[id]')];
  if (!sections.length) return;

  const setActive = (id) => {
    const allLinks = document.querySelectorAll('.nav-link, #mobileMenu a');
    allLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
    });
  };

  setActive('inicio');

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id)
    });
  });
}

/**
 * Maneja comportamiento del header al hacer scroll y hover
 */
function initializeHeaderBehavior() {
  const header = document.getElementById('site-header');
  const heroBg = document.querySelector('#inicio .hero-bg');

  if (!header || !heroBg) return;

  if (!prefersReducedMotion) {
    // Parallax y blur de la imagen del hero mientras se hace scroll dentro del hero
    gsap.to(heroBg, {
      yPercent: -8,
      filter: 'blur(4px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Mover y desvanecer ligeramente el header conforme se hace scroll
    gsap.to(header, {
      y: -6,
      opacity: 0.92,
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Toggle de clases segun posicion para contraste y estilos
  const threshold = 120;
  function onScrollToggle() {
    if (window.scrollY > threshold) {
      header.classList.add('header-scrolled');
      header.classList.remove('header-over-hero');
    } else {
      header.classList.remove('header-scrolled');
      header.classList.add('header-over-hero');
    }
  }

  // Inicializar estado
  onScrollToggle();
  window.addEventListener('scroll', onScrollToggle);
  header.addEventListener('mouseenter', () => {
    header.classList.add('header-hover');
  });
  header.addEventListener('mouseleave', () => {
    header.classList.remove('header-hover');
  });
}
