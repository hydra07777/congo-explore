/* ==========================================================================
   Adresses — liste filtrable de Kinshasa (écran activites.html)
   --------------------------------------------------------------------------
   Filtres instantanés (catégorie, commune, prix maximum, note minimale,
   disponibilité immédiate), tri, compteur, état vide et réinitialisation.
   Aucun rechargement : l’état vit dans l’objet `etat`, l’URL est tenue à jour
   par history.replaceState pour que le lien reste partageable.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, qsa, esc, icone, param, renduEntree } = window.KEUI;

  /* motion.js range ses outils sur window.KE : garde-fou pour rester lisible
     sans animation (et sans GSAP si le CDN ne répond pas). */
  const motion = (window.KE && window.KE.motion) || null;

  /* ------------------------------------------------------------------------
     1. Données dérivées de KE
     ------------------------------------------------------------------------ */

  /** Communes du guide, avec le nombre d’adresses qu’elles contiennent. */
  const COMMUNES = KE.VILLES[0].quartiers
    .map((nom) => ({ nom, nb: KE.FICHES.filter((f) => f.commune === nom).length }))
    .sort((a, b) => b.nb - a.nb || a.nom.localeCompare(b.nom, 'fr'));

  /** Paliers de note proposés en filtre. */
  const PALIERS_NOTE = [
    { valeur: 0, nom: 'Toutes' },
    { valeur: 4, nom: '4,0 et plus' },
    { valeur: 4.5, nom: '4,5 et plus' },
    { valeur: 4.8, nom: '4,8 et plus' }
  ];

  /** Bornes du curseur de prix, calculées sur les fiches (4 $ à 142 $).
      Le pas est de 5 $ ; le plafond est arrondi au pas supérieur (145 $). */
  const PAS = 5;
  const PRIX_MINI = 0; // curseur à zéro : aucun plafond demandé
  const PRIX_MAXI = Math.ceil(Math.max(...KE.FICHES.map((f) => f.aPartirDe.usd)) / PAS) * PAS;

  /* Unités réservables d’une fiche : chambres, créneaux, billets ou séances. */
  const unites = (f) => f.chambres || f.creneaux || f.billets || f.sessions || [];
  const places = (u) => (typeof u.restant === 'number' ? u.restant : u.places);
  /** Places restantes sur l’option la plus tendue d’une fiche. */
  const placesTendues = (f) => unites(f).reduce((min, u) => Math.min(min, places(u)), Infinity);

  /** « Disponibilité immédiate » : au moins trois places sur l’option tendue. */
  const SEUIL_DISPO = 3;
  const dispoImmediate = (f) => placesTendues(f) >= SEUIL_DISPO;

  /* ------------------------------------------------------------------------
     2. État des filtres — source unique de vérité
     ------------------------------------------------------------------------ */
  const etat = {
    ville: 'kinshasa',
    cat: 'tous',
    communes: [],          // aucune commune cochée = toutes les communes
    prixMax: PRIX_MAXI,    // au maximum = sans plafond
    noteMin: 0,
    dispo: false,
    tri: 'pertinence'
  };

  /* ------------------------------------------------------------------------
     3. Critères : filtrage et tri
     ------------------------------------------------------------------------ */

  const correspond = (f) =>
    (etat.cat === 'tous' || f.categorie === etat.cat) &&
    (!etat.communes.length || etat.communes.includes(f.commune)) &&
    (etat.prixMax >= PRIX_MAXI || f.aPartirDe.usd <= etat.prixMax) &&
    f.note >= etat.noteMin &&
    (!etat.dispo || dispoImmediate(f));

  const compareurs = {
    // Pertinence : l’ordre du guide (numéro d’entrée), du plus ancien au plus récent
    pertinence: (a, b) => a.numero - b.numero,
    'prix-croissant': (a, b) => a.aPartirDe.usd - b.aPartirDe.usd || a.numero - b.numero,
    'prix-decroissant': (a, b) => b.aPartirDe.usd - a.aPartirDe.usd || a.numero - b.numero,
    note: (a, b) => b.note - a.note || b.avis - a.avis
  };

  const resultats = () =>
    KE.FICHES.filter(correspond).sort(compareurs[etat.tri] || compareurs.pertinence);

  /* ------------------------------------------------------------------------
     4. Rendu des résultats
     ------------------------------------------------------------------------ */

  /** Bandeau de disponibilité, posé en tête de la colonne de droite. */
  function badgeDispo(f) {
    const reste = placesTendues(f);
    if (reste > 2) {
      return `<span class="entry__dispo">${icone('check')}Disponible pour réservation</span>`;
    }
    return `<span class="entry__dispo entry__dispo--rare">${icone('clock')}Dernières places · ${reste} restante${reste > 1 ? 's' : ''}</span>`;
  }

  /**
   * Reprend le rendu partagé KEUI.renduEntree et y ajoute le bandeau de
   * disponibilité — sans réécrire le gabarit commun.
   */
  function entreeHtml(fiche, rang) {
    const gabarit = document.createElement('div');
    gabarit.innerHTML = renduEntree(fiche, { eager: rang < 3 });
    const colonne = gabarit.querySelector('.entry__side');
    if (colonne) colonne.insertAdjacentHTML('afterbegin', badgeDispo(fiche));
    return gabarit.innerHTML;
  }

  /** Recompose la liste, le compteur et l’état vide. */
  function rafraichir() {
    const liste = qs('#liste-entries');
    const vide = qs('#etat-vide');
    const compte = qs('#compte-resultats');
    const adresses = resultats();

    if (liste) liste.innerHTML = adresses.map(entreeHtml).join('');

    if (compte) {
      compte.textContent = `${adresses.length} adresse${adresses.length > 1 ? 's' : ''}`;
    }
    if (vide) vide.hidden = adresses.length > 0;
    if (liste) liste.hidden = adresses.length === 0;

    // Animations sobres sur les nouvelles entrées (jamais indispensables).
    if (motion && window.gsap && window.ScrollTrigger && !(motion.reduit && motion.reduit())) {
      motion.volets('#liste-entries .entry__thumb img');
      motion.reveler('#liste-entries .entry', { y: 14, stagger: 0.05 });
    }
  }

  /* ------------------------------------------------------------------------
     5. Contrôles de filtre
     ------------------------------------------------------------------------ */

  /** Pastilles de catégorie, avec le nombre d’adresses de chacune. */
  function rendreCategories() {
    const cible = qs('#filtres-categorie');
    if (!cible) return;

    const toutes = KE.CATEGORIES.map(
      (c) =>
        `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.court)} <span class="chip__count num">${KE.FICHES.filter((f) => f.categorie === c.id).length}</span></button>`
    ).join('');

    cible.innerHTML =
      `<button class="chip" type="button" data-cat="tous" aria-pressed="false">Toutes <span class="chip__count num">${KE.FICHES.length}</span></button>` + toutes;
  }

  /** Cases à cocher des communes, avec le nombre d’adresses de chacune. */
  function rendreCommunes() {
    const cible = qs('#filtres-commune');
    if (!cible) return;
    cible.innerHTML = COMMUNES.filter((c) => c.nb > 0)
      .map(
        (c) => `
        <label class="check">
          <input type="checkbox" value="${esc(c.nom)}">
          <span class="check__label">${esc(c.nom)}<span class="check__meta">${c.nb} adresse${c.nb > 1 ? 's' : ''}</span></span>
        </label>`
      )
      .join('');
  }

  /** Pastilles de note minimale, avec le nombre d’adresses concernées. */
  function rendreNotes() {
    const cible = qs('#filtres-note');
    if (!cible) return;
    cible.innerHTML = PALIERS_NOTE.map((p) => {
      const nb = KE.FICHES.filter((f) => f.note >= p.valeur).length;
      return `<button class="chip" type="button" data-note="${p.valeur}" aria-pressed="false">${p.nom} <span class="chip__count num">${nb}</span></button>`;
    }).join('');
  }

  /** Options de tri, depuis KE.TRIS. */
  function rendreTris() {
    const select = qs('#tri');
    if (!select) return;
    select.innerHTML = KE.TRIS.map((t) => `<option value="${esc(t.id)}">${esc(t.nom)}</option>`).join('');
  }

  /** Affiche la valeur du curseur de prix. */
  function rendreValeurPrix() {
    const sortie = qs('#filtre-prix-valeur');
    if (!sortie) return;
    sortie.textContent = etat.prixMax >= PRIX_MAXI ? 'Tous les prix' : `${etat.prixMax} $ et moins`;
  }

  /** Le DOM reflète l’état : pastilles, cases, curseur, tri. */
  function majCommandes() {
    qsa('#filtres-categorie .chip').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.cat === etat.cat))
    );
    qsa('#filtres-note .chip').forEach((b) =>
      b.setAttribute('aria-pressed', String(Number(b.dataset.note) === etat.noteMin))
    );
    qsa('#filtres-commune input').forEach((i) => {
      i.checked = etat.communes.includes(i.value);
    });
    const curseur = qs('#filtre-prix');
    if (curseur) curseur.value = String(etat.prixMax);
    const dispo = qs('#filtre-dispo');
    if (dispo) dispo.checked = etat.dispo;
    const tri = qs('#tri');
    if (tri) tri.value = etat.tri;
    rendreValeurPrix();
  }

  /** Total affiché en tête du panneau de filtres. */
  function rendreTotaux() {
    const total = qs('#filtres-total');
    if (total) total.textContent = String(KE.FICHES.length);
    const adresses = qs('#compte-adresses');
    if (adresses) adresses.textContent = `${KE.FICHES.length} adresses vérifiées`;
  }

  /* ------------------------------------------------------------------------
     6. URL : lecture au chargement, synchronisation à chaque filtre
     ------------------------------------------------------------------------ */

  /** Lit ?cat=, ?commune=, ?ville= (plus prix, note, dispo, tri s’ils existent). */
  function lireUrl() {
    const cat = param('cat', 'tous');
    etat.cat = KE.CATEGORIES.some((c) => c.id === cat) ? cat : 'tous';

    // Les liens du pied de page écrivent « commune=Gombe » : on retrouve la
    // donnée d’origine quelle que soit la casse employée.
    const demandees = param('commune', '')
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
    etat.communes = COMMUNES.filter((c) => demandees.includes(c.nom.toLowerCase())).map((c) => c.nom);

    const prix = parseInt(param('prix', ''), 10);
    // Le curseur avance par pas : la valeur lue est alignée sur ce pas.
    etat.prixMax = Number.isFinite(prix)
      ? Math.min(PRIX_MAXI, Math.max(PRIX_MINI, Math.round(prix / PAS) * PAS))
      : PRIX_MAXI;

    const note = parseFloat(param('note', ''));
    etat.noteMin = Number.isFinite(note) ? Math.min(5, Math.max(0, note)) : 0;

    etat.dispo = param('dispo', '') === '1';

    const tri = param('tri', 'pertinence');
    etat.tri = KE.TRIS.some((t) => t.id === tri) ? tri : 'pertinence';

    etat.ville = param('ville', 'kinshasa');
  }

  /** Réécrit l’URL courante, sans nouvelle entrée dans l’historique. */
  function ecrireUrl() {
    const p = new URLSearchParams();
    if (etat.ville) p.set('ville', etat.ville);
    if (etat.cat !== 'tous') p.set('cat', etat.cat);
    if (etat.communes.length) p.set('commune', etat.communes.join(','));
    if (etat.prixMax < PRIX_MAXI) p.set('prix', String(etat.prixMax));
    if (etat.noteMin > 0) p.set('note', String(etat.noteMin));
    if (etat.dispo) p.set('dispo', '1');
    if (etat.tri !== 'pertinence') p.set('tri', etat.tri);
    try {
      history.replaceState(null, '', `?${p.toString()}`);
    } catch (erreur) {
      /* Certains contextes (fichier local ouvert en file://) interdisent la
         réécriture de l’URL : la page reste utilisable, l’état vit en mémoire. */
    }
  }

  /** Applique un changement d’état : DOM, liste, URL. */
  function mettreAJour() {
    majCommandes();
    rafraichir();
    ecrireUrl();
  }

  /* ------------------------------------------------------------------------
     7. Écouteurs — tout est instantané, aucun rechargement
     ------------------------------------------------------------------------ */
  function initFiltres() {
    // Catégorie
    const cats = qs('#filtres-categorie');
    if (cats) {
      cats.addEventListener('click', (e) => {
        const bouton = e.target.closest('.chip');
        if (!bouton) return;
        etat.cat = bouton.dataset.cat;
        mettreAJour();
      });
    }

    // Note minimale
    const notes = qs('#filtres-note');
    if (notes) {
      notes.addEventListener('click', (e) => {
        const bouton = e.target.closest('.chip');
        if (!bouton) return;
        const valeur = Number(bouton.dataset.note);
        etat.noteMin = valeur === etat.noteMin ? 0 : valeur; // re-cliquer annule
        mettreAJour();
      });
    }

    // Communes (cases à cocher)
    const communes = qs('#filtres-commune');
    if (communes) {
      communes.addEventListener('change', () => {
        etat.communes = qsa('input:checked', communes).map((i) => i.value);
        mettreAJour();
      });
    }

    // Prix maximum (curseur)
    const curseur = qs('#filtre-prix');
    if (curseur) {
      curseur.min = String(PRIX_MINI);
      curseur.max = String(PRIX_MAXI);
      curseur.step = String(PAS);
      curseur.value = String(etat.prixMax);
      curseur.addEventListener('input', () => {
        etat.prixMax = Number(curseur.value);
        mettreAJour();
      });
    }

    // Disponibilité immédiate
    const dispo = qs('#filtre-dispo');
    if (dispo) {
      dispo.addEventListener('change', () => {
        etat.dispo = dispo.checked;
        mettreAJour();
      });
    }

    // Tri
    const tri = qs('#tri');
    if (tri) {
      tri.addEventListener('change', () => {
        etat.tri = tri.value;
        mettreAJour();
      });
    }

    // Réinitialisation (barre de résultats et état vide)
    qsa('[data-reinit]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        etat.cat = 'tous';
        etat.communes = [];
        etat.prixMax = PRIX_MAXI;
        etat.noteMin = 0;
        etat.dispo = false;
        etat.tri = 'pertinence';
        mettreAJour();
      });
    });

    // Panneau de filtres sur mobile
    const bascule = qs('#filtres-toggle');
    const panneau = qs('#filtres');
    if (bascule && panneau) {
      bascule.addEventListener('click', () => {
        const ouvert = panneau.getAttribute('data-open') === 'true';
        panneau.setAttribute('data-open', String(!ouvert));
        bascule.setAttribute('aria-expanded', String(!ouvert));
      });
      // Le panneau se referme dès qu’un filtre est posé sur mobile
      panneau.addEventListener('click', (e) => {
        if (!window.matchMedia('(max-width: 63.99rem)').matches) return;
        if (!e.target.closest('.chip, .check')) return;
        panneau.setAttribute('data-open', 'false');
        bascule.setAttribute('aria-expanded', 'false');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panneau.getAttribute('data-open') === 'true') {
          panneau.setAttribute('data-open', 'false');
          bascule.setAttribute('aria-expanded', 'false');
          bascule.focus();
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     8. Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    rendreTotaux();
    rendreCategories();
    rendreCommunes();
    rendreNotes();
    rendreTris();
    lireUrl();
    initFiltres();
    majCommandes();
    rafraichir();
    ecrireUrl();
  });
})();