// main.js - controla loader, logo animado, menú y scroll suave
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.min.js";
import ScrollToPlugin from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollToPlugin.min.js";

gsap.registerPlugin(ScrollToPlugin);

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
});

// Safety fallback: if for any reason `is-loading` permanece tras 4s, quitarlo para mostrar el contenido
setTimeout(() => {
  if (document.body.classList.contains('is-loading')) {
    console.warn('[Loader] Fallback: removing is-loading after timeout');
    document.body.classList.remove('is-loading');
    document.body.removeAttribute('aria-busy');
    const app = document.getElementById('app');
    if (app) app.style.visibility = 'visible';
  }
}, 4000);
