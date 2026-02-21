// scroll.js - animaciones con GSAP + ScrollTrigger
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.min.js";
import ScrollTrigger from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.min.js";

// activa los mensajes y elementos de depuración (set to true sólo durante desarrollo)
const DEBUG = false;

gsap.registerPlugin(ScrollTrigger);

/**
 * Anima el texto del hero al hacer scroll
 */
function animateHeroOnScroll() {
  const heroTitle = document.querySelector('.hero-title');

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

  sections.forEach((section) => {
    // Skip sections that have image sequences (they use pin + their own animation)
    if (section.id === 'nosotros' || section.id === 'servicios') return;
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

  contentElements.forEach((element) => {
    // Determina si la sección es "nosotros" o "servicios" para la dirección de entrada
    const section = element.closest('section');
    const isNosotros = section && section.id === 'nosotros';
    const isServicios = section && section.id === 'servicios';
    
    // Establece la dirección de entrada
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
  });
}

// Ejecutar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (DEBUG) console.log('[Scroll] DOMContentLoaded - initializing scroll animations');
    animateHeroOnScroll();
    animateSectionsOnScroll();
    animateSectionContent();
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
 * Crea una secuencia de imágenes que se cambia según el scroll (pin + scrub)
 * @param {string} sectionId Id de la sección (ej. 'nosotros')
 * @param {string[]} imagePaths Array con rutas relativas a las imágenes
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
      console.log('[ImageSeq] fallback loaded for', sectionId);
    });
    fallbackImg.addEventListener('error', () => {
      console.error('[ImageSeq] fallback failed for', sectionId, fallbackImg.src);
    });
  }

  // limpiar contenedor si ya tiene imágenes (pero conservar fallback estático)
  const existingFallback = container.querySelector('.seq-fallback');
  container.innerHTML = '';
  if (existingFallback) container.appendChild(existingFallback);

  // si estamos en modo debug, creamos indicadores visibles
  let placeholder, status;
  if (DEBUG) {
    placeholder = document.createElement('div');
    placeholder.className = 'seq-placeholder';
    placeholder.textContent = 'Cargando imágenes...';
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

  // helper: normalizar rutas para que sean absolutas desde la raíz
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

  // aplicar escalado inicial sólo si primera imagen es Paisaje1 en sección servicios
  if (sectionId === 'servicios' && imgs[0] && imgs[0].src.includes('Paisaje1.jpg')) {
    imgs[0].style.transform = 'scale(1.1)';
  }

  imgs.forEach((img, i) => {
    img.style.opacity = i === 0 ? '1' : '0';
    img.style.filter = i === 0 ? 'blur(0px)' : 'blur(2px)';
    img.style.transform = 'scale(1)';
  });

  // Ajustes para una transición más rápida y sutil
  // Reduce aún más el scroll por imagen para cambios rápidos (35% desktop, 30% mobile)
  const stepPercent = window.matchMedia('(max-width: 768px)').matches ? 30 : 35;
  const totalPercent = imagePaths.length * stepPercent;

  // Asegurar que el contenedor tenga posición relativa y sea visible
  container.style.position = container.style.position || 'relative';
  container.style.zIndex = container.style.zIndex || '20';
  // Garantía de altura mínima por si algún reset CSS colapsa el elemento
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

  // Debug: log computed style y bounds (solo si está activado)
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
      console.warn('[ImageSeq] ninguna imagen cargó para', sectionId);
      if (status) status.textContent = 'Error: no se cargaron imágenes';
      // usar un placeholder embebido (data URI, pequeña imagen) para asegurar visibilidad
      const dataSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#e6e6e6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#707070" font-size="20">Imagen no disponible</text></svg>');
      container.style.backgroundImage = `url(${dataSvg})`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      // además inyectar un <img> con la misma dataURI para asegurar visibilidad en todos los navegadores
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
      // quitar placeholder si por alguna razón quedó
      if (placeholder && placeholder.parentElement) placeholder.parentElement.removeChild(placeholder);
    }
  }, 2000);

  // gridEl ya fue calculado más arriba, solo validamos
  if (!gridEl) return;

  // ensure container and imgs are above other elements
  container.style.zIndex = container.style.zIndex || '20';
  imgs.forEach((img, idx) => { img.style.zIndex = idx === 0 ? '999' : '21'; });

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
        const dist = Math.abs(floatIdx - i);
        const opacity = Math.max(0, 1 - dist);
        // nunca poner blur en la imagen activa (dist===0)
        const blur = dist === 0 ? 0 : Math.min(2, dist * 2);
        // hacer más grande Paziale1 y asegurarse de que no se desenfoque
        let scale = 1;
        if (sectionId === 'servicios' && img.src.includes('Paisaje1.jpg')) {
          scale = 1.1;
        }

        gsap.to(img, {
          opacity,
          // si se trata de Paisaje1 o Paisaje2 siempre sin blur
          filter: (img.src.includes('Paisaje1.jpg') || img.src.includes('Paisaje2.jpg')) ? 'blur(0px)' : `blur(${blur}px)`,
          scale,
          duration: 0.12,
          ease: 'power1.out',
          overwrite: true
        });
      });
    },
    // no actions onLeave/EnterBack required when no pinning
  });
}


/**
 * Maneja comportamiento del header al hacer scroll y hover
 */
function initializeHeaderBehavior() {
  const header = document.getElementById('site-header');
  const heroBg = document.querySelector('#inicio .hero-bg');

  if (!header || !heroBg) return;

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

  // Toggle de clases según posición para contraste y estilos
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
