/**
 * Alfombras Tapices Clean - Core Application Logic
 * High-performance vanilla TypeScript / zero external animation libs
 */

// Declare GTM dataLayer on window
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. Google Tag Manager Event Tracking
  // ----------------------------------------------------
  window.dataLayer = window.dataLayer || [];

  function trackCta(ctaId: string) {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'cta_click',
        cta: ctaId,
      });
    }
  }

  document.querySelectorAll<HTMLElement>('.cta-track').forEach((el) => {
    el.addEventListener('click', () => {
      const cta = el.getAttribute('data-cta') || 'unspecified_cta';
      trackCta(cta);
    });
  });

  // ----------------------------------------------------
  // 2. Scroll Progress Bar
  // ----------------------------------------------------
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const mobileBottomBar = document.getElementById('mobile-bottom-bar');
  const desktopWaBtn = document.getElementById('desktop-wa-button');
  const heroSection = document.getElementById('hero');
  const cotizadorSection = document.getElementById('cotizador');

  let ticking = false;

  function updateScrollMetrics() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }

    // Hero visibility calculation for fixed CTAs
    const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 500;
    const cotizadorTop = cotizadorSection ? cotizadorSection.offsetTop : Infinity;
    const isPastHero = scrollY > heroBottom - 200;
    const isAtCotizador = scrollY + window.innerHeight > cotizadorTop + 150;

    // Mobile bottom bar visibility
    if (mobileBottomBar) {
      if (isPastHero && !isAtCotizador) {
        mobileBottomBar.classList.remove('translate-y-full');
      } else {
        mobileBottomBar.classList.add('translate-y-full');
      }
    }

    // Desktop floating WhatsApp button visibility
    if (desktopWaBtn) {
      if (isPastHero) {
        desktopWaBtn.classList.remove('opacity-0', 'pointer-events-none');
        desktopWaBtn.classList.add('opacity-100');
      } else {
        desktopWaBtn.classList.add('opacity-0', 'pointer-events-none');
        desktopWaBtn.classList.remove('opacity-100');
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollMetrics);
      ticking = true;
    }
  }, { passive: true });

  updateScrollMetrics();

  // ----------------------------------------------------
  // 3. Stagger Reveal (.rv) & Hero Underline
  // ----------------------------------------------------
  const rvElements = document.querySelectorAll<HTMLElement>('.rv');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    rvElements.forEach((el) => el.classList.add('is-revealed'));
    document.querySelectorAll('.hero-underline').forEach((el) => el.classList.add('drawn'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.classList.add('is-revealed');

          // Trigger hero underline when hero heading appears
          if (target.id === 'hero-heading' || target.querySelector('#hero-heading')) {
            setTimeout(() => {
              document.querySelectorAll('.hero-underline').forEach((el) => el.classList.add('drawn'));
            }, 300);
          }
          obs.unobserve(target);
        }
      });
    }, { threshold: 0.15 });

    rvElements.forEach((el, index) => {
      el.style.transitionDelay = `${(index % 4) * 110}ms`;
      revealObserver.observe(el);
    });

    // Also reveal hero underline if already in viewport
    setTimeout(() => {
      document.querySelectorAll('.hero-underline').forEach((el) => el.classList.add('drawn'));
    }, 450);
  }

  // ----------------------------------------------------
  // 4. Parallax Effect (Hero & Empresas, max ±30px)
  // ----------------------------------------------------
  const heroImg = document.getElementById('hero-parallax-img') as HTMLElement | null;
  const empresasImg = document.getElementById('empresas-parallax-img') as HTMLElement | null;

  if (!prefersReducedMotion && (heroImg || empresasImg)) {
    let parallaxScheduled = false;

    function applyParallax() {
      const scrollY = window.scrollY;

      if (heroImg && heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
          const offset = Math.max(-30, Math.min(30, (scrollY - heroSection.offsetTop) * 0.08));
          heroImg.style.transform = `scale(1.05) translateY(${offset}px)`;
        }
      }

      if (empresasImg) {
        const empresasSection = document.getElementById('empresas');
        if (empresasSection) {
          const empRect = empresasSection.getBoundingClientRect();
          if (empRect.top < window.innerHeight && empRect.bottom > 0) {
            const relOffset = (window.innerHeight - empRect.top) / window.innerHeight;
            const offset = Math.max(-30, Math.min(30, (relOffset - 0.5) * 40));
            empresasImg.style.transform = `scale(1.05) translateY(${offset}px)`;
          }
        }
      }

      parallaxScheduled = false;
    }

    window.addEventListener('scroll', () => {
      if (!parallaxScheduled) {
        requestAnimationFrame(applyParallax);
        parallaxScheduled = true;
      }
    }, { passive: true });
  }

  // ----------------------------------------------------
  // 5. Hero Mini-Cotizador Form
  // ----------------------------------------------------
  const heroServiceSelect = document.getElementById('hero-service-select') as HTMLSelectElement | null;
  const heroComunaSelect = document.getElementById('hero-comuna-select') as HTMLSelectElement | null;
  const heroMiniCta = document.getElementById('hero-mini-cta') as HTMLAnchorElement | null;

  function updateHeroMiniLink() {
    if (!heroServiceSelect || !heroComunaSelect || !heroMiniCta) return;
    const s = heroServiceSelect.value;
    const c = heroComunaSelect.value;
    const msg = `Hola Alfombras Tapices Clean, quiero cotizar: ${s} en ${c}.`;
    heroMiniCta.href = `https://api.whatsapp.com/send?phone=56983295267&text=${encodeURIComponent(msg)}`;
  }

  heroServiceSelect?.addEventListener('change', updateHeroMiniLink);
  heroComunaSelect?.addEventListener('change', updateHeroMiniLink);
  updateHeroMiniLink();

  // ----------------------------------------------------
  // 6. Navigation Active Link Tracking
  // ----------------------------------------------------
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
  const sectionsToTrack = ['servicios', 'ficha-tecnica', 'proceso', 'trabajos', 'empresas', 'preguntas', 'cotizador'];

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const linkSection = link.getAttribute('data-nav-section');
          const dot = link.querySelector<HTMLElement>('.active-dot');
          if (linkSection === id) {
            link.classList.add('text-[var(--ink)]', 'font-semibold');
            if (dot) dot.classList.remove('hidden');
          } else {
            link.classList.remove('text-[var(--ink)]', 'font-semibold');
            if (dot) dot.classList.add('hidden');
          }
        });
      }
    });
  }, { threshold: 0.35 });

  sectionsToTrack.forEach((secId) => {
    const secEl = document.getElementById(secId);
    if (secEl) sectionObserver.observe(secEl);
  });

  // Smooth scroll offset handling for anchor links
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 72;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        // Close mobile drawer if open
        closeMobileMenu();
      }
    });
  });

  // ----------------------------------------------------
  // 7. Synchronized Technical Table & Rotating "EN FOCO" Cards
  // ----------------------------------------------------
  const serviceCards = document.querySelectorAll<HTMLElement>('.service-card');
  const techRows = document.querySelectorAll<HTMLElement>('.tech-row');
  let currentActiveServiceIndex = 1; // Default to card 1 (Alfombras decorativas)
  let rotationTimer: number | null = null;
  let rotationStartTime = Date.now();
  const rotationDuration = 5000;
  let isRotationPaused = false;
  let isServicesSectionVisible = false;

  function setActiveService(index: number, resetProgress = true) {
    currentActiveServiceIndex = index;
    if (resetProgress) {
      rotationStartTime = Date.now();
    }

    // Update Service Cards
    serviceCards.forEach((card, i) => {
      const badge = card.querySelector<HTMLElement>('.foco-badge');
      const progressFill = card.querySelector<HTMLElement>('.progress-fill');

      if (i === index) {
        card.classList.add('border-[var(--ink)]', 'bg-white');
        card.classList.remove('bg-[var(--paper)]');
        badge?.classList.remove('hidden');
      } else {
        card.classList.remove('border-[var(--ink)]', 'bg-white');
        card.classList.add('bg-[var(--paper)]');
        badge?.classList.add('hidden');
        if (progressFill) progressFill.style.width = '0%';
      }
    });

    // Update Technical Specs Table Rows
    techRows.forEach((row, i) => {
      const includesCell = row.children[3] as HTMLElement | undefined;
      if (i === index) {
        row.classList.add('bg-[var(--ink)]', 'text-white');
        row.classList.remove('bg-white', 'text-[var(--ink)]');
        if (includesCell) {
          includesCell.classList.add('text-[var(--fresh)]');
          includesCell.classList.remove('text-[var(--fresh-ink)]', 'text-[var(--ink-soft)]');
        }
      } else {
        row.classList.remove('bg-[var(--ink)]', 'text-white');
        row.classList.add('bg-white');
        if (includesCell) {
          includesCell.classList.remove('text-[var(--fresh)]');
          if (i === 2) {
            includesCell.classList.add('text-[var(--fresh-ink)]');
          } else {
            includesCell.classList.add('text-[var(--ink-soft)]');
          }
        }
      }
    });
  }

  function tickServiceRotation() {
    if (!prefersReducedMotion && !isRotationPaused && isServicesSectionVisible) {
      const elapsed = Date.now() - rotationStartTime;
      const progress = Math.min(100, (elapsed / rotationDuration) * 100);

      const activeCard = serviceCards[currentActiveServiceIndex];
      const fill = activeCard?.querySelector<HTMLElement>('.progress-fill');
      if (fill) {
        fill.style.width = `${progress}%`;
      }

      if (elapsed >= rotationDuration) {
        const nextIndex = (currentActiveServiceIndex + 1) % serviceCards.length;
        setActiveService(nextIndex);
      }
    }
    rotationTimer = requestAnimationFrame(tickServiceRotation);
  }

  // Observe Services section visibility for pausing rotation
  const servicesSec = document.getElementById('servicios');
  if (servicesSec) {
    const sObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        isServicesSectionVisible = e.isIntersecting;
        if (isServicesSectionVisible) {
          rotationStartTime = Date.now();
        }
      });
    }, { threshold: 0.2 });
    sObs.observe(servicesSec);
  }

  // Hover & Click interactions
  serviceCards.forEach((card) => {
    const idx = parseInt(card.getAttribute('data-service-index') || '0', 10);
    card.addEventListener('mouseenter', () => {
      isRotationPaused = true;
      setActiveService(idx);
    });
    card.addEventListener('mouseleave', () => {
      isRotationPaused = false;
      rotationStartTime = Date.now();
    });
    card.addEventListener('focusin', () => {
      isRotationPaused = true;
      setActiveService(idx);
    });
    card.addEventListener('focusout', () => {
      isRotationPaused = false;
      rotationStartTime = Date.now();
    });
  });

  techRows.forEach((row) => {
    const idx = parseInt(row.getAttribute('data-service-index') || '0', 10);
    row.addEventListener('click', () => {
      setActiveService(idx);
    });
    row.addEventListener('mouseenter', () => {
      setActiveService(idx);
    });
  });

  // Start rotation
  setActiveService(currentActiveServiceIndex);
  if (!prefersReducedMotion) {
    rotationTimer = requestAnimationFrame(tickServiceRotation);
  }

  // ----------------------------------------------------
  // 8. Ruta del Proceso SVG & Interactive Panel
  // ----------------------------------------------------
  const procesoSection = document.getElementById('proceso');
  const routePathActive = document.getElementById('route-path-active') as SVGPathElement | null;
  const routeTravelingDot = document.getElementById('route-traveling-dot') as SVGCircleElement | null;
  const processNodes = document.querySelectorAll<HTMLElement>('.process-node');

  const panelStepNum = document.getElementById('panel-step-number');
  const panelStepTitle = document.getElementById('panel-step-title');
  const panelStepDesc = document.getElementById('panel-step-desc');
  const processDetailPanel = document.getElementById('process-detail-panel');

  const processStepData = [
    {
      num: 'ETAPA 01',
      title: 'Contacto directo sin intermediarios',
      desc: 'Escríbenos por WhatsApp, llámanos o completa el cotizador con las medidas y comuna de tu domicilio para recibir una propuesta personalizada y sin compromiso.',
    },
    {
      num: 'ETAPA 02',
      title: 'Coordinación y asesoría inmediata',
      desc: 'Un especialista se pone en contacto contigo para coordinar la fecha y hora de tu servicio, resolver inquietudes y evaluar el método ideal para tu requerimiento.',
    },
    {
      num: 'ETAPA 03',
      title: 'Tratamiento técnico especializado',
      desc: 'Aplicamos el método preciso de cada superficie: máquinas rotativas, inyección-extracción profunda o desinfección con vapor y amonio cuaternario.',
    },
    {
      num: 'ETAPA 04',
      title: 'Entrega y desinfección total',
      desc: 'Superficies sin manchas, olores, ácaros ni bacterias. En alfombras decorativas, el retiro y la entrega en tu domicilio se realizan sin costo adicional.',
    },
  ];

  function updateProcessPanel(stepIndex: number) {
    if (!processDetailPanel || !panelStepNum || !panelStepTitle || !panelStepDesc) return;
    const data = processStepData[stepIndex];
    if (!data) return;

    // 250ms crossfade
    processDetailPanel.style.opacity = '0.3';
    setTimeout(() => {
      panelStepNum.textContent = data.num;
      panelStepTitle.textContent = data.title;
      panelStepDesc.textContent = data.desc;
      processDetailPanel.style.opacity = '1';
    }, 120);

    // Update nodes styling
    processNodes.forEach((node, i) => {
      const indicator = node.querySelector<HTMLElement>('.node-indicator');
      if (i === stepIndex) {
        node.classList.add('border-[var(--ink)]', 'bg-[var(--paper-2)]');
        if (indicator) {
          indicator.classList.remove('bg-[var(--paper-2)]', 'border-[var(--line)]');
          indicator.classList.add('bg-[var(--fresh)]', 'border-[var(--ink)]');
        }
      } else {
        node.classList.remove('border-[var(--ink)]', 'bg-[var(--paper-2)]');
        if (indicator) {
          indicator.classList.add('bg-[var(--paper-2)]', 'border-[var(--line)]');
          indicator.classList.remove('bg-[var(--fresh)]', 'border-[var(--ink)]');
        }
      }
    });
  }

  processNodes.forEach((node) => {
    const step = parseInt(node.getAttribute('data-step') || '1', 10) - 1;
    node.addEventListener('mouseenter', () => updateProcessPanel(step));
    node.addEventListener('click', () => updateProcessPanel(step));
  });

  // Scroll scrub for SVG path
  if (routePathActive && procesoSection && !prefersReducedMotion) {
    const activePath = routePathActive;
    const pathLength = activePath.getTotalLength ? activePath.getTotalLength() : 1000;
    activePath.style.strokeDasharray = `${pathLength}`;
    activePath.style.strokeDashoffset = `${pathLength}`;

    function updateRouteScroll() {
      if (!procesoSection) return;
      const rect = procesoSection.getBoundingClientRect();
      const secH = procesoSection.offsetHeight;
      const windowH = window.innerHeight;

      // Calculate progress while section is in viewport
      const start = windowH * 0.8;
      const end = -secH * 0.2;
      const totalDist = start - end;
      const currentDist = start - rect.top;

      const p = Math.max(0, Math.min(1, currentDist / totalDist));

      activePath.style.strokeDashoffset = `${pathLength * (1 - p)}`;

      if (routeTravelingDot && activePath.getPointAtLength) {
        const point = activePath.getPointAtLength(p * pathLength);
        routeTravelingDot.setAttribute('cx', `${point.x}`);
        routeTravelingDot.setAttribute('cy', `${point.y}`);
      }

      // Automatically sync active step based on scroll progress if not hovered
      const stepIdx = Math.min(3, Math.floor(p * 4));
      // update nodes gently
      processNodes.forEach((n, i) => {
        const ind = n.querySelector<HTMLElement>('.node-indicator');
        if (i <= stepIdx && ind) {
          ind.classList.add('bg-[var(--fresh)]', 'border-[var(--ink)]');
        }
      });
    }

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateRouteScroll);
    }, { passive: true });
    updateRouteScroll();
  }

  // ----------------------------------------------------
  // 9. Galería de Trabajos & Lightbox
  // ----------------------------------------------------
  const galleryFilterBtns = document.querySelectorAll<HTMLButtonElement>('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll<HTMLElement>('.gallery-item');

  // Reveal gallery items with clip-path on scroll
  const galleryObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  galleryItems.forEach((item, i) => {
    item.style.transitionDelay = `${(i % 4) * 80}ms`;
    galleryObserver.observe(item);
  });

  // Filter chips handler
  galleryFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';

      // Update active button state
      galleryFilterBtns.forEach((b) => {
        b.classList.remove('bg-[var(--ink)]', 'text-white');
        b.classList.add('bg-[var(--paper-2)]', 'text-[var(--ink-soft)]');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('bg-[var(--ink)]', 'text-white');
      btn.classList.remove('bg-[var(--paper-2)]', 'text-[var(--ink-soft)]');
      btn.setAttribute('aria-selected', 'true');

      // Filter gallery cards
      galleryItems.forEach((item) => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.classList.add('is-revealed');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox Implementation
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxQuoteBtn = document.getElementById('lightbox-quote-btn') as HTMLAnchorElement | null;

  let currentGalleryIndex = 0;
  const visibleGalleryItems = Array.from(galleryItems);

  function openLightbox(index: number) {
    if (!lightboxModal || !lightboxImg || !lightboxCounter || !lightboxCaption) return;
    currentGalleryIndex = index;
    const targetItem = visibleGalleryItems[currentGalleryIndex];
    if (!targetItem) return;

    const fullSrc = targetItem.getAttribute('data-full') || '';
    const title = targetItem.getAttribute('data-title') || 'Trabajo realizado';
    const alt = targetItem.querySelector('img')?.getAttribute('alt') || title;

    lightboxImg.src = fullSrc;
    lightboxImg.alt = alt;
    lightboxCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(visibleGalleryItems.length).padStart(2, '0')}`;
    lightboxCaption.textContent = title;

    if (lightboxQuoteBtn) {
      const waMsg = `Hola Alfombras Tapices Clean, quiero cotizar un trabajo similar a: ${title}.`;
      lightboxQuoteBtn.href = `https://api.whatsapp.com/send?phone=56983295267&text=${encodeURIComponent(waMsg)}`;
    }

    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function nextLightbox() {
    const nextIdx = (currentGalleryIndex + 1) % visibleGalleryItems.length;
    openLightbox(nextIdx);
  }

  function prevLightbox() {
    const prevIdx = (currentGalleryIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
    openLightbox(prevIdx);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxNext?.addEventListener('click', nextLightbox);
  lightboxPrev?.addEventListener('click', prevLightbox);

  // Keyboard navigation & Esc to close
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || lightboxModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Swipe support for Lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  lightboxModal?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxModal?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextLightbox();
    if (touchEndX > touchStartX + 50) prevLightbox();
  }, { passive: true });

  // ----------------------------------------------------
  // 10. Cotizador Interactivo — Live Preview & WhatsApp Link
  // ----------------------------------------------------
  const serviceChips = document.querySelectorAll<HTMLButtonElement>('.service-chip');
  const cotizadorComuna = document.getElementById('cotizador-comuna') as HTMLSelectElement | null;
  const cotizadorSlider = document.getElementById('cotizador-slider') as HTMLInputElement | null;
  const sliderDisplayVal = document.getElementById('slider-display-val');
  const sliderUnknownCheck = document.getElementById('slider-unknown-check') as HTMLInputElement | null;
  const cotizadorName = document.getElementById('cotizador-name') as HTMLInputElement | null;
  const cotizadorNotes = document.getElementById('cotizador-notes') as HTMLInputElement | null;
  const liveChatPreview = document.getElementById('live-chat-preview');
  const cotizadorSubmitBtn = document.getElementById('cotizador-submit-btn') as HTMLAnchorElement | null;
  const serviceErrorHelper = document.getElementById('service-error-helper');

  const selectedServices = new Set<string>(['Limpieza de Alfombras Decorativas']);

  function updateCotizador() {
    const servicesArr = Array.from(selectedServices);
    const hasServices = servicesArr.length > 0;

    // Validation
    if (!hasServices) {
      if (serviceErrorHelper) serviceErrorHelper.classList.remove('hidden');
      if (cotizadorSubmitBtn) {
        cotizadorSubmitBtn.classList.add('opacity-50', 'pointer-events-none');
        cotizadorSubmitBtn.setAttribute('aria-disabled', 'true');
      }
      if (liveChatPreview) {
        liveChatPreview.textContent = 'Selecciona al menos un servicio para armar tu mensaje.';
      }
      return;
    }

    if (serviceErrorHelper) serviceErrorHelper.classList.add('hidden');
    if (cotizadorSubmitBtn) {
      cotizadorSubmitBtn.classList.remove('opacity-50', 'pointer-events-none');
      cotizadorSubmitBtn.removeAttribute('aria-disabled');
    }

    const comuna = cotizadorComuna?.value || 'Viña del Mar';
    const isUnknown = sliderUnknownCheck?.checked || false;
    const m2 = isUnknown ? 'superficie por definir' : `aprox. ${cotizadorSlider?.value || 25} m²`;
    const nameVal = cotizadorName?.value.trim();
    const notesVal = cotizadorNotes?.value.trim();

    // Construct live message
    let message = 'Hola Alfombras Tapices Clean';
    if (nameVal) {
      message += `, soy ${nameVal}`;
    }
    message += `. Quiero cotizar: ${servicesArr.join(' + ')}, en ${comuna}, ${m2}.`;
    if (notesVal) {
      message += ` Detalle: ${notesVal}.`;
    }

    if (liveChatPreview) {
      liveChatPreview.textContent = message;
    }

    if (cotizadorSubmitBtn) {
      cotizadorSubmitBtn.href = `https://api.whatsapp.com/send?phone=56983295267&text=${encodeURIComponent(message)}`;
    }
  }

  serviceChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const sName = chip.getAttribute('data-service-name') || '';
      const checkIcon = chip.querySelector<HTMLElement>('.chip-check');

      if (selectedServices.has(sName)) {
        selectedServices.delete(sName);
        chip.classList.remove('bg-[var(--ink)]', 'text-white', 'border-[var(--ink)]');
        chip.classList.add('bg-[var(--paper)]', 'text-[var(--ink)]');
        chip.setAttribute('aria-pressed', 'false');
        if (checkIcon) checkIcon.classList.replace('opacity-100', 'opacity-0');
      } else {
        selectedServices.add(sName);
        chip.classList.add('bg-[var(--ink)]', 'text-white', 'border-[var(--ink)]');
        chip.classList.remove('bg-[var(--paper)]', 'text-[var(--ink)]');
        chip.setAttribute('aria-pressed', 'true');
        if (checkIcon) checkIcon.classList.replace('opacity-0', 'opacity-100');
      }
      updateCotizador();
    });
  });

  cotizadorSlider?.addEventListener('input', () => {
    if (sliderUnknownCheck) sliderUnknownCheck.checked = false;
    if (sliderDisplayVal) sliderDisplayVal.textContent = `${cotizadorSlider.value} m²`;
    updateCotizador();
  });

  sliderUnknownCheck?.addEventListener('change', () => {
    if (sliderUnknownCheck.checked) {
      if (sliderDisplayVal) sliderDisplayVal.textContent = 'No definido';
    } else {
      if (sliderDisplayVal && cotizadorSlider) sliderDisplayVal.textContent = `${cotizadorSlider.value} m²`;
    }
    updateCotizador();
  });

  cotizadorComuna?.addEventListener('change', updateCotizador);
  cotizadorName?.addEventListener('input', updateCotizador);
  cotizadorNotes?.addEventListener('input', updateCotizador);
  updateCotizador();

  // ----------------------------------------------------
  // 11. Clipboard Copy Buttons (+56983295267 & Email)
  // ----------------------------------------------------
  document.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy') || '';
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.textContent;
        btn.textContent = 'Copiado';
        btn.classList.add('bg-[var(--fresh-ink)]', 'text-white');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('bg-[var(--fresh-ink)]', 'text-white');
        }, 2000);
      } catch (err) {
        console.warn('Clipboard copy failed:', err);
      }
    });
  });

  // ----------------------------------------------------
  // 12. Mobile Drawer Navigation
  // ----------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeMenuIcon = document.getElementById('close-menu-icon');

  function openMobileMenu() {
    if (!mobileDrawer || !mobileMenuBtn) return;
    mobileDrawer.classList.remove('translate-x-full');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.setAttribute('aria-label', 'Cerrar menú');
    hamburgerIcon?.classList.add('hidden');
    closeMenuIcon?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileDrawer || !mobileMenuBtn) return;
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Abrir menú');
    hamburgerIcon?.classList.remove('hidden');
    closeMenuIcon?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  mobileMenuBtn?.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
});
