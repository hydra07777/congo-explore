/* ==========================================================================
   Accueil — rendu des sections + chorégraphie GSAP/ScrollTrigger
   ========================================================================== */

(function () {
  'use strict';

  const { qs, qsa, esc, icone, teinte, nb, dec, renduEntree, categorie } = window.KEUI;
  const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => window.matchMedia('(min-width: 64rem)').matches;

  /* ------------------------------------------------------------------------
     1. Rendu des sections
     ------------------------------------------------------------------------ */

  /** Communes -> liste déroulante de la barre de recherche. */
  function rendreCommunes() {
    const sel = qs('#f-commune');
    if (!sel) return;
    sel.insertAdjacentHTML(
      'beforeend',
      KE.VILLES[0].quartiers.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')
    );
  }

  /** Raccourcis de recherche : les cinq catégories en pastilles teintées. */
  function rendreRaccourcis() {
    const cible = qs('#raccourcis-categories');
    if (!cible) return;
    cible.innerHTML = KE.CATEGORIES.map((c) => {
      const nb = KE.FICHES.filter((f) => f.categorie === c.id).length;
      return `
        <a class="raccourci raccourci--${teinte(c.id)}" href="activites.html?cat=${c.id}">
          <span class="raccourci__icone">${icone(c.icone)}</span>
          ${esc(c.nom)}
          <span class="raccourci__compte num">${nb}</span>
        </a>`;
    }).join('');
  }

  /** Deux repères chiffrés, dérivés des données affichées plus bas. */
  function rendreReperes() {
    const moinsCher = KE.FICHES.reduce((a, b) => (b.aPartirDe.usd < a.aPartirDe.usd ? b : a));
    const mieuxNote = KE.FICHES.reduce((a, b) => (b.note > a.note ? b : a));
    const moyenne = KE.FICHES.reduce((s, f) => s + f.note, 0) / KE.FICHES.length;
    const totalAvis = KE.FICHES.reduce((s, f) => s + f.avis, 0);

    const prix = qs('#carte-prix-valeur');
    if (prix) prix.textContent = `${moinsCher.aPartirDe.usd} $`;
    const prixPied = qs('#carte-prix-pied');
    if (prixPied) prixPied.textContent = `${moinsCher.titre} · ${moinsCher.unite}`;

    const noteEl = qs('#carte-note-valeur');
    if (noteEl) noteEl.textContent = `${dec(mieuxNote.note, 1)}/5`;
    const notePied = qs('#carte-note-pied');
    if (notePied) notePied.textContent = mieuxNote.titre;

    const titre = qs('#hero-note');
    if (titre) titre.textContent = `Note moyenne ${dec(moyenne, 1)}/5`;
    const detail = qs('#hero-note-detail');
    if (detail) detail.textContent = `sur ${nb(totalAvis)} avis publiés dans la maquette`;
  }

  /** Cartes d’adresses : tout, ou une seule catégorie. */
  function rendreIndex(filtre) {
    const cible = qs('#liste-entries');
    if (!cible) return;
    const fiches = filtre && filtre !== 'tous' ? KE.FICHES.filter((f) => f.categorie === filtre) : KE.FICHES;
    cible.innerHTML = fiches.map((f, i) => renduEntree(f, { eager: i < 3 })).join('');
    if (window.KE.motion) {
      KE.motion.reveleCartes('#liste-entries .entry');
    }
  }

  /** Villes en préparation. */
  function rendreVillesSoon() {
    const cible = qs('#villes-soon');
    if (!cible) return;
    cible.innerHTML = KE.VILLES.filter((v) => v.statut === 'bientot')
      .map(
        (v) => `
        <li class="ville-soon" data-reveal>
          <span class="ville-soon__nom">${esc(v.nom)}</span>
          <span class="tag tag--vide">Bientôt</span>
          <span class="ville-soon__province">${esc(v.province)}</span>
          <p class="ville-soon__note">${esc(v.note)}</p>
        </li>`
      )
      .join('');
  }

  /** Catégories : tuiles teintées, icône dessinée, nombre d’adresses. */
  function rendreCategories() {
    const cible = qs('#liste-cats');
    if (!cible) return;
    cible.innerHTML = KE.CATEGORIES.map((c) => {
      const nb = KE.FICHES.filter((f) => f.categorie === c.id).length;
      return `
        <li class="cat cat--${teinte(c.id)}" data-reveal>
          <a class="cat__lien" href="activites.html?cat=${c.id}">
            <span class="cat__icone">${icone(c.icone)}</span>
            <span class="cat__name"><span>${esc(c.nom)}</span><span class="cat__count num">${nb} adresses</span></span>
            <span class="cat__text">${esc(c.texte)}</span>
            <span class="link-arrow">Explorer ${icone('arrowRight')}</span>
          </a>
        </li>`;
    }).join('');
  }

  /** Réassurance, moyens de paiement, avis. */
  function rendreConfiance() {
    const assurances = qs('#liste-assurances');
    if (assurances) {
      assurances.innerHTML = KE.REASSURANCE.map(
        (r) => `
        <li class="assure" data-reveal>
          <span class="assure__icone">${icone(r.icone)}</span>
          <h3 class="assure__title">${esc(r.titre)}</h3>
          <p>${esc(r.texte)}</p>
        </li>`
      ).join('');
    }

    const paiements = qs('#liste-paiements');
    if (paiements) {
      paiements.innerHTML = KE.PAIEMENTS.map((p) => {
        const g = p.type === 'mobile' ? 'phone' : p.type === 'carte' ? 'card' : 'wallet';
        return `<li class="pay">${icone(g)}<span>${esc(p.nom)}</span></li>`;
      }).join('');
    }

    const avis = qs('#liste-avis');
    if (avis) {
      avis.innerHTML = KE.TEMOIGNAGES.map((t, i) => {
        const initiales = t.auteur.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').map((m) => m[0]).join('').slice(0, 2).toUpperCase();
        return `
        <blockquote class="avis__item" data-reveal>
          <p class="avis__texte">« ${esc(t.texte)} »</p>
          <p class="avis__auteur">
            <span class="avis__avatar avis__avatar--${i + 1}" aria-hidden="true">${esc(initiales)}</span>
            <span><b>${esc(t.auteur)}</b> · ${esc(t.lieu)}</span>
          </p>
        </blockquote>`;
      }).join('');
    }
  }

  /* ------------------------------------------------------------------------
     2. Filtres de l’index
     ------------------------------------------------------------------------ */
  function initFiltres() {
    const groupe = qs('#filtres-index');
    if (!groupe) return;
    groupe.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filtre]');
      if (!btn) return;
      qsa('[data-filtre]', groupe).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      rendreIndex(btn.dataset.filtre);
    });
  }

  /* ------------------------------------------------------------------------
     3. Entrée du héros — le moment signé de la page
     ------------------------------------------------------------------------ */
  function entreeHeros() {
    const timeline = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.08 });

    timeline
      // Les trois photos montent en cascade, la grande d’abord
      .from('.hero__photo', { y: 34, opacity: 0, scale: 0.96, duration: 1.1, stagger: 0.1 })
      // Le titre se lève derrière son masque, ligne par ligne
      .from('.hero__titre .ligne', { yPercent: 115, duration: 1, stagger: 0.09 }, 0.15)
      .from('.hero__lede', { y: 18, opacity: 0, duration: 0.8 }, 0.42)
      .from('.hero__recherche', { y: 20, opacity: 0, duration: 0.8 }, 0.5)
      .from('.hero__recherche .fiche__field, .hero__recherche .fiche__go', { opacity: 0, y: 10, duration: 0.5, stagger: 0.05 }, 0.6)
      .from('.raccourci', { y: 14, opacity: 0, duration: 0.6, stagger: 0.05 }, 0.7)
      .from('.hero__confiance > *', { y: 12, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.8)
      // Les deux repères flottants se posent, jamais depuis scale(0)
      .from('.carte-flottante', { y: 18, opacity: 0, scale: 0.94, duration: 0.8, stagger: 0.12 }, 0.75)
      .from('.hero__etiquette', { y: 10, opacity: 0, duration: 0.6 }, 0.9);

    return timeline;
  }

  /* ------------------------------------------------------------------------
     4. Parcours — section épinglée, rail rose, étapes qui s’allument
     ------------------------------------------------------------------------ */
  function parcours() {
    const stage = qs('#parcours-stage');
    const fill = qs('#parcours-fill');
    const steps = qsa('#parcours-list .step');
    if (!stage || !fill || !steps.length) return;

    if (!desktop()) {
      KE.motion.reveler('#parcours-list .step', { y: 16, stagger: 0.08 });
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: stage,
          start: 'top 70%',
          once: true,
          onEnter: () => steps.forEach((s) => s.setAttribute('data-active', 'true'))
        });
      }
      return;
    }

    steps.forEach((s, i) => s.setAttribute('data-active', i === 0 ? 'true' : 'false'));

    gsap
      .timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top 28%',
          end: '+=120%',
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const actif = Math.min(steps.length - 1, Math.floor(self.progress * steps.length + 0.15));
            steps.forEach((s, i) => s.setAttribute('data-active', i <= actif ? 'true' : 'false'));
          }
        }
      })
      .fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      .from('#parcours-list .step', { opacity: 0, y: 20, duration: 0.5, stagger: 0.22 }, 0);
  }

  /* ------------------------------------------------------------------------
     5. Parallaxe du collage (couche décorative uniquement)
     ------------------------------------------------------------------------ */
  function parallaxeHeros() {
    const img = qs('#hero-image');
    if (!img) return;
    gsap.fromTo(
      img,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: '.hero__collage', start: 'top 80%', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true }
      }
    );
    gsap.to('.hero__photo--grande', {
      y: -14,
      ease: 'none',
      scrollTrigger: { trigger: '.hero__collage', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
    });
  }

  /* ------------------------------------------------------------------------
     6. Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    rendreCommunes();
    rendreRaccourcis();
    rendreReperes();
    rendreIndex('tous');
    rendreVillesSoon();
    rendreCategories();
    rendreConfiance();
    initFiltres();

    if (!window.KE.motion || !KE.motion.enregistrer()) return;

    KE.motion.reveler('.strip__item, [data-reveal]');
    KE.motion.volets('.ville-featured__plate img');

    if (reduit()) {
      gsap.set('.hero__titre .ligne, .hero__lede, .hero__recherche, .raccourci, .carte-flottante, .hero__photo', { clearProps: 'all' });
      qsa('#parcours-list .step').forEach((s) => s.setAttribute('data-active', 'true'));
      return;
    }

    entreeHeros();
    parcours();
    parallaxeHeros();
  });
})();