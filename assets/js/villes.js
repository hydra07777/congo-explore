/* ==========================================================================
   Villes — cartes « bientôt » + inscription à l’ouverture (écran villes.html)
   --------------------------------------------------------------------------
   Tout le contenu vient de KE (data.js). La carte vedette de Kinshasa est
   écrite en HTML (comme sur l’accueil) ; les cinq villes en préparation sont
   rendues ici, depuis KE.VILLES.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, qsa, esc, icone } = window.KEUI;

  /* motion.js range ses outils sur window.KE : on y accède avec un garde-fou
     pour que la page reste parfaitement lisible sans animation. */
  const motion = (window.KE && window.KE.motion) || null;

  /* ------------------------------------------------------------------------
     1. Villes en préparation
     ------------------------------------------------------------------------ */

  /** Injecte les icônes déclaratives des blocs insérés après le chargement. */
  function brancherIcones(racine) {
    qsa('[data-icone]', racine).forEach((noeud) => {
      if (noeud.firstElementChild) return; // déjà traité
      noeud.insertAdjacentHTML('afterbegin', icone(noeud.getAttribute('data-icone')));
    });
  }

  /**
   * Une carte « bientôt » par ville non encore ouverte : province et note
   * d’avancement, sans lien — il n’y a rien à réserver.
   */
  function rendreVillesSoon() {
    const grille = qs('#villes-grid');
    if (!grille) return;

    const cartes = KE.VILLES.filter((v) => v.statut !== 'disponible')
      .map(
        (v) => `
        <article class="ville-card ville-card--soon">
          <div class="ville-card__plate" aria-hidden="true">
            <span data-icone="pin"></span>
            <span class="tag tag--ghost">Bientôt</span>
          </div>
          <div class="ville-card__body">
            <h3 class="ville-card__nom">${esc(v.nom)}</h3>
            <p class="caption ville-card__meta">Province ${esc(v.province)}</p>
            <p class="ville-card__texte">${esc(v.note)}</p>
          </div>
        </article>`
      )
      .join('');

    grille.insertAdjacentHTML('beforeend', cartes);
    brancherIcones(grille);
  }

  /** Les comptes de l’en-tête viennent des données, jamais du HTML. */
  function rendreComptes() {
    const adresses = qs('#compte-adresses');
    if (adresses) {
      adresses.textContent = `${KE.FICHES.length} adresse${KE.FICHES.length > 1 ? 's' : ''} à Kinshasa`;
    }
    const villes = qs('#compte-villes');
    if (villes) {
      const nb = KE.VILLES.filter((v) => v.statut !== 'disponible').length;
      villes.textContent = `${nb} ville${nb > 1 ? 's' : ''} en préparation`;
    }
  }

  /* ------------------------------------------------------------------------
     2. Inscription à l’ouverture — formulaire factice, sans rechargement
     ------------------------------------------------------------------------ */

  /** Ajoute les villes en préparation à la liste déroulante. */
  function remplirVilles() {
    const select = qs('#inscription-ville');
    if (!select) return;
    select.innerHTML = KE.VILLES.filter((v) => v.statut !== 'disponible')
      .map((v) => `<option value="${esc(v.id)}">${esc(v.nom)} — province ${esc(v.province)}</option>`)
      .join('');
  }

  /** Contrôle de forme : un format d’adresse suffisant pour la maquette. */
  const adresseValide = (valeur) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);

  function initInscription() {
    const formulaire = qs('#form-inscription');
    if (!formulaire) return;

    const champ = qs('#inscription-email');
    const erreur = qs('#inscription-erreur');
    const confirmation = qs('#inscription-confirmation');
    const select = qs('#inscription-ville');

    formulaire.addEventListener('submit', (evenement) => {
      evenement.preventDefault(); // aucune requête, aucun rechargement

      const courriel = champ.value.trim();
      if (!adresseValide(courriel)) {
        champ.setAttribute('aria-invalid', 'true');
        if (erreur) erreur.hidden = false;
        if (confirmation) confirmation.hidden = true;
        champ.focus();
        return;
      }

      champ.removeAttribute('aria-invalid');
      if (erreur) erreur.hidden = true;

      const villeId = select ? select.value : '';
      const ville = (KE.VILLES.find((v) => v.id === villeId) || {}).nom || 'votre ville';
      if (confirmation) {
        confirmation.innerHTML = `${icone('check')}<span>C’est noté : nous écrirons à <b>${esc(courriel)}</b> le jour de l’ouverture de <b>${esc(ville)}</b>. Message de démonstration — rien n’est réellement enregistré.</span>`;
        confirmation.hidden = false;
      }

      // Le champ est vidé : l’état confirme que la demande est prise en compte.
      formulaire.reset();
    });
  }

  /* ------------------------------------------------------------------------
     3. Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    rendreVillesSoon();
    rendreComptes();
    remplirVilles();
    initInscription();

    // Animations sobres : révélation des cartes, volet sur la planche vedette.
    if (!motion || (motion.reduit && motion.reduit()) || !motion.enregistrer()) return;
    motion.reveler('#villes-grid .ville-card, .panel, .forts li', { y: 18, stagger: 0.06 });
    motion.volets('#villes-grid .ville-card--featured .ville-card__plate img');
  });
})();