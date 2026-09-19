/* ==========================================================================
   Motion — orchestration GSAP partagée
   Un seul moment signé par page, révélations regroupées (batch), mouvement
   réduit respecté. On n’anime que transform / opacity / clip-path / filter.
   ========================================================================== */

window.KE = window.KE || {};

(function (KE) {
  'use strict';

  const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* GSAP vient d’un CDN : sur un réseau coupé (cas réel à Kinshasa), la page
     doit rester complète et lisible. Chaque fonction publique sort donc
     proprement si la bibliothèque n’est pas là. */
  const gsapDispo = () => Boolean(window.gsap);

  /** Enregistre les plugins une fois pour toutes les pages. */
  function enregistrer() {
    if (!window.gsap || !window.ScrollTrigger) return false;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'expo.out', duration: 0.9 });
    return true;
  }

  /**
   * Révélation en lot : chaque élément marqué [data-reveal] entre avec un
   * léger décalage vertical et un fondu, décalé par groupe visible.
   */
  function reveler(selecteur, options) {
    if (reduit() || !gsapDispo()) return; // rien n’est masqué : tout est déjà lisible
    const o = options || {};
    const cibles = gsap.utils.toArray(selecteur || '[data-reveal]');
    if (!cibles.length) return;

    cibles.forEach((el) => {
      if (el.dataset.revealEtat === 'pret') return;
      el.dataset.revealEtat = 'pret';
      gsap.set(el, { opacity: 0, y: o.y === undefined ? 18 : o.y });
    });

    ScrollTrigger.batch(cibles, {
      start: 'top 88%',
      once: true,
      batchMax: 6,
      onEnter: (lot) =>
        gsap.to(lot, {
          opacity: 1,
          y: 0,
          duration: o.duration || 0.75,
          stagger: o.stagger === undefined ? 0.06 : o.stagger,
          ease: 'expo.out',
          overwrite: true,
          onStart: () => lot.forEach((el) => (el.dataset.revealEtat = 'fait'))
        })
    });
  }

  /**
   * Révélation des cartes : montée douce + très léger agrandissement.
   * Réservée aux grilles de cartes (une carte ne se révèle pas comme une ligne
   * de texte), et sans effet si le mouvement est réduit ou GSAP absent.
   */
  function reveleCartes(selecteur) {
    if (reduit() || !gsapDispo()) return;
    const cibles = gsap.utils.toArray(selecteur);
    if (!cibles.length) return;
    cibles.forEach((el) => {
      if (el.dataset.reveleCartes === 'fait') return;
      el.dataset.reveleCartes = 'fait';
      gsap.set(el, { opacity: 0, y: 22, scale: 0.985 });
    });
    ScrollTrigger.batch(cibles, {
      start: 'top 90%',
      once: true,
      batchMax: 6,
      onEnter: (lot) =>
        gsap.to(lot, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out', overwrite: true })
    });
  }

  /**
   * Volet d’image : le visuel se découvre du bas vers le haut via clip-path
   * (pas de mise en page recalculée), avec un très léger zoom.
   * L’état masqué est posé ici, en JS, et uniquement pour ce qui est hors
   * écran : sans JavaScript, ou si GSAP ne charge pas, l’image reste visible.
   */
  function volets(selecteur) {
    if (reduit() || !gsapDispo()) return; // les images restent visibles
    gsap.utils.toArray(selecteur || '.js-unmask').forEach((el) => {
      const cible = el.tagName === 'IMG' ? el : el.querySelector('img') || el;
      const horsEcran = el.getBoundingClientRect().top > window.innerHeight * 0.85;
      if (horsEcran) gsap.set(cible, { clipPath: 'inset(0 0 100% 0)' });
      gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      })
        .fromTo(
          cible,
          { clipPath: 'inset(0 0 100% 0)', scale: 1.06 },
          { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.05, ease: 'expo.out', immediateRender: false }
        );
    });
  }

  /** Parallaxe douce sur les couches décoratives uniquement. */
  function parallaxe(selecteur, amplitude) {
    if (!gsapDispo()) return;
    gsap.utils.toArray(selecteur || '[data-parallax]').forEach((el) => {
      const force = parseFloat(el.dataset.parallax) || amplitude || -8;
      gsap.fromTo(
        el,
        { yPercent: 0 },
        {
          yPercent: force,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('[data-parallax-scope]') || el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  /** Trait qui se dessine (tirets animés par mise à l’échelle du conteneur). */
  function tracer(selecteur) {
    if (!gsapDispo()) return;
    gsap.utils.toArray(selecteur || '[data-trace]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('[data-trace-scope]') || el, start: 'top 80%', end: 'bottom 55%', scrub: 0.4 }
        }
      );
    });
  }

  /** Entrée des éléments marqués [data-rise] au chargement (sans scroll). */
  function entree(selecteur, options) {
    if (!gsapDispo()) return null;
    const o = options || {};
    const cibles = gsap.utils.toArray(selecteur);
    if (!cibles.length) return gsap.timeline();
    return gsap.timeline({ defaults: { ease: 'expo.out' } }).from(cibles, {
      y: o.y === undefined ? 20 : o.y,
      opacity: 0,
      duration: o.duration || 0.85,
      stagger: o.stagger === undefined ? 0.07 : o.stagger
    });
  }

  /** Initialise ce qui doit l’être sur toute page, hors mouvement réduit. */
  function initCommun() {
    if (!enregistrer()) return;
    if (reduit()) {
      gsap.set('[data-reveal], .js-unmask', { clearProps: 'all' });
      return;
    }
    reveler();
    volets();
  }

  KE.motion = { enregistrer, reveler, reveleCartes, volets, parallaxe, tracer, entree, initCommun, reduit, ScrollTrigger: null };

  document.addEventListener('DOMContentLoaded', () => {
    initCommun();
    // Les images arrivent après coup : on recalcule les déclencheurs une fois
    // tout chargé, et après le chargement des polices.
    window.addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.ScrollTrigger && ScrollTrigger.refresh());
    }
  });
})(window.KE);
