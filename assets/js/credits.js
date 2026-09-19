/* ==========================================================================
   Crédits — provenance des photographies
   --------------------------------------------------------------------------
   La liste est lue dans assets/img/credits.json, au format :
     [{ fichier, titre, auteur, licence, source }]
   Le fichier peut aussi être fourni par la page sous la forme
   window.KE_CREDITS (utile quand la maquette est ouverte en local et que le
   navigateur refuse de lire un fichier voisin). S’il est absent ou illisible,
   la zone affiche un état vide explicite plutôt qu’une liste muette.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, esc, icone, nb } = window.KEUI;

  const CHEMIN = 'assets/img/credits.json';

  /* ------------------------------------------------------------------------
     1. Chargement du fichier de crédits
     ------------------------------------------------------------------------ */

  /** Convertit la réponse en tableau, ou rejette si la forme n’est pas la bonne. */
  function verifier(donnees) {
    if (!Array.isArray(donnees)) throw new Error('forme inattendue');
    return donnees;
  }

  /** Lecture par fetch (serveur local ou hébergement). */
  function parFetch() {
    if (!window.fetch) return Promise.reject(new Error('fetch indisponible'));
    return window
      .fetch(CHEMIN, { cache: 'no-store' })
      .then((reponse) => {
        if (!reponse.ok) throw new Error(`statut ${reponse.status}`);
        return reponse.json();
      })
      .then(verifier);
  }

  /** Lecture par XMLHttpRequest : dernier recours, et seul moyen sur certains
      navigateurs quand la page est ouverte directement depuis le disque. */
  function parXhr() {
    return new Promise((resoudre, rejeter) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', CHEMIN, true);
      xhr.overrideMimeType('application/json');
      xhr.onload = () => {
        try {
          resoudre(verifier(JSON.parse(xhr.responseText)));
        } catch (e) {
          rejeter(e);
        }
      };
      xhr.onerror = () => rejeter(new Error('lecture impossible'));
      xhr.onabort = () => rejeter(new Error('lecture interrompue'));
      xhr.send();
    });
  }

  /** Source des crédits, dans l’ordre des possibilités. */
  function charger() {
    if (Array.isArray(window.KE_CREDITS)) return Promise.resolve(verifier(window.KE_CREDITS));
    return parFetch().catch(() => parXhr());
  }

  /* ------------------------------------------------------------------------
     2. Rendu
     ------------------------------------------------------------------------ */

  /** Valeur de secours quand un champ manque dans le fichier. */
  const ou = (valeur, defaut) => (valeur === undefined || valeur === null || valeur === '' ? defaut : String(valeur));

  function rendre(donnees) {
    const zone = qs('#zone-credits');
    if (!zone) return;

    if (!donnees.length) {
      rendreVide('Le fichier de crédits existe mais ne contient aucune entrée pour le moment.');
      return;
    }

    const lignes = donnees
      .map((c) => {
        const source = ou(c.source, '');
        const lien = source
          ? `<a class="link-arrow" href="${esc(source)}" target="_blank" rel="noopener noreferrer">
               Page d’origine ${icone('arrowRight')}
             </a>`
          : '<span class="caption">Source non renseignée</span>';
        return `
          <div>
            <dt>${esc(ou(c.titre, ou(c.fichier, 'Image sans titre')))}</dt>
            <dd>
              ${esc(ou(c.auteur, 'Auteur non renseigné'))} · ${esc(ou(c.licence, 'Licence non renseignée'))}
              <br><span class="caption">${esc(ou(c.fichier, 'fichier inconnu'))}</span>
              <br>${lien}
            </dd>
          </div>`;
      })
      .join('');

    zone.innerHTML = `
      <dl class="pratique" id="credits-liste">${lignes}</dl>
      <p class="caption">${donnees.length} photographie${donnees.length > 1 ? 's' : ''} créditée${donnees.length > 1 ? 's' : ''}.</p>`;
  }

  /** État vide travaillé : on nomme le problème et la façon de le résoudre. */
  function rendreVide(raison) {
    const zone = qs('#zone-credits');
    if (!zone) return;
    zone.innerHTML = `
      <div class="empty">
        <h3>La liste des crédits n’est pas encore disponible</h3>
        <p>
          Les photographies de la maquette proviennent de Wikimedia Commons et sont créditées fichier par
          fichier, avec l’auteur et la licence. ${esc(raison)}
        </p>
        <p>
          Si vous ouvrez cette maquette directement depuis le disque, le navigateur interdit souvent la
          lecture d’un fichier voisin : ouvrez la page depuis un serveur local, ou vérifiez que le
          fichier de crédits du dossier des images a bien été publié.
        </p>
        <p class="caption caption--phrase">Images : Wikimedia Commons — auteurs et licences à confirmer</p>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     3. Démarrage
     ------------------------------------------------------------------------ */

  function init() {
    // Taux de référence affiché dans la section sur les données fictives.
    const taux = qs('#taux-reference');
    if (taux) taux.textContent = nb(KE.TAUX_USD_CDF);

    charger()
      .then((donnees) => rendre(donnees))
      .catch(() => rendreVide('Le fichier de crédits n’a pas pu être lu depuis cette page.'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();