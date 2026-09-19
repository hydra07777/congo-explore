/* ==========================================================================
   Core — icônes, utilitaires, en-tête, rendu partagé
   Aucune bibliothèque hors GSAP. Chargé sur toutes les pages.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Jeu d’icônes maison — trait unique de 1.6, grille 24, bouts ronds.
        (Aucun émoji, aucune icône de police : tout est dessiné ici.)
     ------------------------------------------------------------------------ */
  const ICONES = {
    bed: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M6 10V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3"/><path d="M10 10V8.5"/>',
    fork: '<path d="M7 3v7a2 2 0 0 0 4 0V3"/><path d="M9 12v9"/><path d="M16 3c1.7 1.2 2.5 3 2.5 5.5S17.7 13 16 14v7"/>',
    cup: '<path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M6 4.5c0 1 1 1.2 1 2.2"/><path d="M10 4c0 1.2 1 1.4 1 2.6"/>',
    ticket: '<path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4Z"/><path d="M12 6v2M12 11v2M12 16v2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5Z"/>',
    shield: '<path d="M12 3l7 3v6c0 4-3 6.8-7 9-4-2.2-7-5-7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    phone: '<rect x="6.5" y="3" width="11" height="18" rx="2"/><path d="M11 6h2"/><path d="M12 9.5v3"/><path d="m10.2 11.2 1.8 1.3 1.8-1.3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    star: '<path d="m12 4 2.3 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.8 2.6L8.3 13.3l-4-3.7 5.4-.6Z"/>',
    pin: '<path d="M12 21s6.5-6.1 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 14.9 12 21 12 21Z"/><circle cx="12" cy="10.3" r="2.3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17"/><path d="M8 3.5v3M16 3.5v3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/><path d="M16 7.2a3 3 0 0 1 0 5.6"/><path d="M17.5 14.8c2 .6 3.2 2 3.2 4.2"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19"/><path d="M6 14.5h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>',
    arrowRight: '<path d="M4 12h15"/><path d="m13.5 6.5 5.5 5.5-5.5 5.5"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
    chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    spark: '<path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6 10.4 12.2 5 10.6 10.4 9Z"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-13 0 9-5 13-14 13Z"/><path d="M5 19c3-4 6.5-6.5 11-8"/>',
    waters: '<path d="M4 9c2.5-2 4.5-2 7 0s4.5 2 7 0"/><path d="M4 14c2.5-2 4.5-2 7 0s4.5 2 7 0"/><path d="M4 19c2.5-2 4.5-2 7 0s4.5 2 7 0"/>',
    utensils: '<path d="M6 3v8a2 2 0 0 0 4 0V3"/><path d="M8 11v10"/><path d="M15.5 21V3c2 1.5 3 4 3 7.5s-1 5.5-3 6.5"/>'
  };

  /** Retourne le balisage SVG d’une icône du jeu maison. */
  function icone(nom, extraClass) {
    const d = ICONES[nom] || ICONES.info;
    const cls = extraClass ? `icon ${extraClass}` : 'icon';
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  }

  /* ------------------------------------------------------------------------
     2. Utilitaires
     ------------------------------------------------------------------------ */
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Échappe le texte destiné au innerHTML. */
    const esc = (s) =>
      String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* Formatage des nombres sans dépendre d’Intl : certains navigateurs
       mobiles embarquent un ICU réduit et afficheraient « 4.7 » au lieu de
       « 4,7 ». Les séparateurs français sont donc posés à la main. */
    const nb = (n) => {
      const [ent] = Number(n).toFixed(0).split('.');
      return ent.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // espace fine insécable
    };
    const dec = (n, d) => {
      const [ent, frac] = Number(n).toFixed(d === undefined ? 1 : d).split('.');
      return `${ent.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')},${frac}`;
    };
    /** Montant : entier sans décimale, sinon deux décimales. */
    const montant = (n) => (Number.isInteger(n) ? nb(n) : dec(n, 2));

  /** Lit un paramètre d’URL (?ville=...&cat=...). */
  const param = (nom, defaut) => new URLSearchParams(location.search).get(nom) || defaut || '';

  /** Prix formaté US$ + équivalent CDF. */
  const prix = (p, taille) =>
    `<span class="price${taille === 'sm' ? ' price--sm' : ''}">
       <span class="price__usd">${montant(p.usd)} $</span>
       <span class="price__cdf">≈ ${KE.cdf(p.usd)}</span>
     </span>`;

  /** Note en étoiles typographique (jamais d’émoji). */
  const note = (valeur, nbAvis) => `
    <span class="rating">
      ${icone('star')}
      <span>${dec(valeur, 1)}</span>
      ${nbAvis ? `<span class="rating__count">· ${nb(nbAvis)} avis</span>` : ''}
    </span>`;

  /** Catégorie à partir de son identifiant. */
  const categorie = (id) => KE.CATEGORIES.find((c) => c.id === id) || KE.CATEGORIES[0];
  /** Fiche à partir de son identifiant. */
  const fiche = (id) => KE.FICHES.find((f) => f.id === id);

  /* ------------------------------------------------------------------------
     3. En-tête : ombre au défilement, menu mobile, lien courant
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = qs('.site-header');
    if (!header) return;

    // Hauteur réelle du bandeau -> variable utilisée par scroll-padding.
    const majHauteur = () =>
      document.documentElement.style.setProperty('--header-h', `${Math.round(header.offsetHeight)}px`);
    majHauteur();
    window.addEventListener('resize', majHauteur, { passive: true });

    const onScroll = () => header.setAttribute('data-stuck', window.scrollY > 8 ? 'true' : 'false');
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Menu mobile
    const toggle = qs('.nav__toggle', header);
    const nav = qs('.nav', header);
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const ouvert = nav.getAttribute('data-open') === 'true';
        nav.setAttribute('data-open', String(!ouvert));
        toggle.setAttribute('aria-expanded', String(!ouvert));
        toggle.innerHTML = icone(ouvert ? 'menu' : 'close');
        toggle.setAttribute('aria-label', ouvert ? 'Ouvrir le menu' : 'Fermer le menu');
      });
      // Fermeture au clavier et au clic sur un lien
      nav.addEventListener('click', (e) => {
        if (e.target.closest('a') && window.matchMedia('(max-width: 61.99rem)').matches) {
          nav.setAttribute('data-open', 'false');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = icone('menu');
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
          nav.setAttribute('data-open', 'false');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = icone('menu');
          toggle.focus();
        }
      });
    }

    // Lien courant
    const page = location.pathname.split('/').pop() || 'index.html';
    qsa('.nav__link', header).forEach((a) => {
      if (a.getAttribute('href') === page) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------------------------
     4. Teinte par catégorie — la couleur porte la carte, pas un liseré
     ------------------------------------------------------------------------ */
  const TEINTES = {
    hotel: 'indigo',
    restaurant: 'corail',
    cafe: 'ambre',
    evenement: 'violet',
    experience: 'turquoise'
  };
  const teinte = (idCat) => TEINTES[idCat] || 'rose';

  /* ------------------------------------------------------------------------
     5. Rendu d’une carte d’adresse (partagé : accueil, liste, suggestions)
     ------------------------------------------------------------------------ */
  function renduEntree(f, options) {
    const o = options || {};
    const cat = categorie(f.categorie);
    return `
      <article class="entry" data-entree="${esc(f.id)}">
        <a class="entry__lien" href="fiche.html?id=${encodeURIComponent(f.id)}">
          <figure class="entry__thumb plate">
            <img src="${f.image}" alt="${esc(f.titre)} — ${esc(f.legende)}"
                 loading="${o.eager ? 'eager' : 'lazy'}" decoding="async" width="760" height="522">
            <span class="entry__num num" aria-hidden="true">${String(f.numero).padStart(2, '0')}</span>
            <span class="tag tag--sur-photo entry__categorie">${icone(cat.icone)}${esc(cat.court)}</span>
          </figure>
          <div class="entry__body">
            <p class="entry__where">${icone('pin')}${esc(f.commune)} · ${esc(f.quartier)}</p>
            <h3 class="entry__title">${esc(f.titre)}</h3>
            <p class="entry__note">${esc(f.resume)}</p>
            <div class="entry__side">
              ${note(f.note, f.avis)}
              <span class="price">
                <span class="price__usd">${montant(f.aPartirDe.usd)} $</span>
                <span class="price__cdf">${esc(f.unite)}</span>
              </span>
              <span class="entry__fleche" aria-hidden="true">${icone('arrowRight')}</span>
            </div>
          </div>
        </a>
      </article>`;
  }

  /* ------------------------------------------------------------------------
     6. Pied de page (injecté sur toutes les pages)
     ------------------------------------------------------------------------ */
  function initFooter() {
    const cible = qs('[data-footer]');
    if (!cible) return;
    const communes = KE.VILLES[0].quartiers.slice(0, 6);
    cible.innerHTML = `
      <div class="wrap footer__top">
        <div class="footer__about">
          <a class="brand" href="index.html">
            <svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="1.5" y="1.5" width="29" height="29" rx="3" stroke="currentColor" stroke-width="1.4"/>
              <path d="M8 23V9l8 7 8-7v14" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <circle cx="16" cy="16" r="2.4" fill="#EA4C89"/>
            </svg>
            <span>Kongo Explore</span>
          </a>
          <p>Réserver un hôtel, une table, un concert ou une sortie sur le fleuve à Kinshasa — et bientôt dans tout le pays.</p>
          <p class="caption caption--phrase">Kinshasa · République démocratique du Congo</p>
        </div>
        <div class="footer__col">
          <h3>Explorer</h3>
          <ul>
            <li><a href="activites.html?cat=hotel">Hôtels</a></li>
            <li><a href="activites.html?cat=restaurant">Restaurants</a></li>
            <li><a href="activites.html?cat=cafe">Cafés</a></li>
            <li><a href="activites.html?cat=evenement">Événements</a></li>
            <li><a href="activites.html?cat=experience">Expériences</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3>Communes</h3>
          <ul>${communes.map((c) => `<li><a href="activites.html?commune=${encodeURIComponent(c)}">${esc(c)}</a></li>`).join('')}</ul>
        </div>
        <div class="footer__col">
          <h3>La plateforme</h3>
          <ul>
            <li><a href="villes.html">Villes disponibles</a></li>
            <li><a href="index.html#parcours">Comment ça marche</a></li>
            <li><a href="index.html#confiance">Paiement et garanties</a></li>
            <li><a href="credits.html">Crédits photos</a></li>
            <li><a href="index.html#confiance">Devenir partenaire</a></li>
          </ul>
        </div>
      </div>
      <div class="wrap footer__bottom">
        <p class="footer__note">Maquette de démonstration : les établissements, prix et avis affichés sont des données fictives créées pour la présentation. Aucun paiement n’est traité.</p>
        <p>© ${new Date().getFullYear()} Kongo Explore — Kinshasa</p>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initFooter();
    // Injecte les icônes déclaratives : <span data-icone="star"></span>
    qsa('[data-icone]').forEach((n) => {
      n.insertAdjacentHTML('afterbegin', icone(n.getAttribute('data-icone')));
    });
  });

  /* Exposé globalement (scripts de page) */
  window.KEUI = { ICONES, icone, qs, qsa, esc, nb, dec, montant, param, prix, note, categorie, fiche, teinte, renduEntree };
})();
