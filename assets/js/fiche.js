/* ==========================================================================
   Fiche — détail d’une adresse
   --------------------------------------------------------------------------
   Tout le contenu vient de KE.FICHES (assets/js/data.js) ; la fiche affichée
   est celle du paramètre d’URL ?id=slug, avec repli sur la première fiche.
   Aucune donnée n’est écrite en dur dans fiche.html.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, esc, param, icone, nb, dec, categorie, fiche, renduEntree } = window.KEUI;

  /* ------------------------------------------------------------------------
     1. Petits utilitaires dérivés des données
     ------------------------------------------------------------------------ */

  /** Petit texte de disponibilité, calculé selon le type de la fiche. */
  function disponibilite(f) {
    let total = 0;
    let mot = 'places';
    if (f.chambres) { total = f.chambres.reduce((t, c) => t + c.restant, 0); mot = 'chambres'; }
    else if (f.creneaux) {
      total = f.creneaux.reduce((t, c) => t + c.places, 0);
      mot = f.categorie === 'cafe' ? 'places' : 'tables';
    } else if (f.billets) { total = f.billets.reduce((t, b) => t + b.restant, 0); mot = 'billets'; }
    else if (f.sessions) { total = f.sessions.reduce((t, s) => t + s.places, 0); mot = 'places'; }

    const rare = total > 0 && total <= 3;
    return {
      total,
      mot,
      court: total === 0 ? 'Complet sur les prochaines dates' : `${total} ${mot} libres`,
      long: total === 0
        ? 'Plus aucune place au relevé de la semaine. Les dates suivantes seront remises en ligne dès vérification.'
        : `${total} ${mot} encore ${total > 1 ? 'disponibles' : 'disponible'} au moment du relevé de la fiche.`,
      rare
    };
  }

  /** Verbe d’action du bouton, selon la catégorie. */
  function verbeReservation(f) {
    return {
      hotel: 'Réserver une chambre',
      restaurant: 'Réserver une table',
      cafe: 'Réserver une place',
      evenement: 'Réserver des billets',
      experience: 'Réserver une place'
    }[f.categorie] || 'Réserver';
  }

  /** Prix de base de la fiche, précédé de l’unité annoncée. */
  function blocPrix(f, taille) {
    return `${window.KEUI.prix(f.aPartirDe, taille)} <span class="caption">${esc(f.unite)}</span>`;
  }

  /* ------------------------------------------------------------------------
     2. Description longue — rédigée à partir des données de la fiche
     ------------------------------------------------------------------------ */

  function paragraphes(f) {
    const cat = categorie(f.categorie);
    const p = f.pratique || {};
    const texte = [];

    /* a. Situation géographique et nature de l’adresse. */
    texte.push(
      `${f.titre} se situe dans la commune de ${f.commune}. Le repère indiqué sur la fiche est « ${f.quartier} ». ` +
      `${p.distance ? p.distance.charAt(0).toUpperCase() + p.distance.slice(1) + '. ' : ''}` +
      `${cat.texte}`
    );

    /* b. Ce que l’on réserve concrètement, selon le type. */
    if (f.chambres) {
      const bas = f.chambres[0];
      const haut = f.chambres[f.chambres.length - 1];
      texte.push(
        `On y réserve une chambre et ses nuits sans passer par un appel : ${f.chambres.length} catégories sont ouvertes, ` +
        `de « ${bas.nom} » à ${KE.usd(bas.prix.usd)} la nuit (soit ${KE.cdf(bas.prix.usd)}) ` +
        `jusqu’à « ${haut.nom} » à ${KE.usd(haut.prix.usd)} la nuit. ` +
        `La fiche annonce ${p.capacite || 'plusieurs chambres'} ; les disponibilités affichées sont celles du relevé.`
      );
    } else if (f.creneaux) {
      const liste = f.creneaux.map((c) => `${c.nom} (${c.heures})`).join(', ');
      texte.push(
        `La réservation porte sur un créneau plutôt que sur une table précise : ${liste}. ` +
        `Chaque service a son quota de couverts, et le créneau choisi vous engage à l’heure annoncée. ` +
        `${disponibilite(f).long}`
      );
    } else if (f.billets) {
      const liste = f.billets.map((b) => `${b.nom} à ${KE.usd(b.prix.usd)}`).join(', ');
      texte.push(
        `Trois formules s’ouvrent en ligne : ${liste}. Chaque billet est numéroté et le placement — fosse, ` +
        `balcon ou loge — est celui de l’option choisie. Les billets sont présentés à l’entrée sur le téléphone, ` +
        `sans impression obligatoire.`
      );
    } else if (f.sessions) {
      const liste = f.sessions.map((s) => `${s.nom}, de ${s.heures}`).join(' · ');
      texte.push(
        `La sortie se réserve par séance : ${liste}. Le départ se fait en groupe réduit, ce qui laisse le temps ` +
        `de poser des questions au guide. ${disponibilite(f).long}`
      );
    }

    /* c. Intendance : horaires, langues, règlement (les points forts sont déjà
       listés juste au-dessus et repris dans le tableau pratique : on ne les
       répète pas ici). */
    texte.push(
      `${p.horaires ? `Ouverture : ${p.horaires}. ` : ''}` +
      `${p.langues ? `L’équipe parle ${p.langues}. ` : ''}` +
      `${p.paiement && p.paiement.length ? `Règlement accepté sur place : ${p.paiement.join(', ')}.` : ''}`
    );

    /* d. Ce que vaut la vérification, et les garanties de la plateforme. */
    texte.push(
      `L’adresse a été visitée avant publication : eau, courant, accès et prix réel ont été constatés sur place. ` +
      `La réservation se confirme en ligne, le montant est retenu jusqu’à votre arrivée et l’annulation reste ` +
      `gratuite jusqu’à 24 heures avant.`
    );

    return texte;
  }

  /* ------------------------------------------------------------------------
     3. Rendus
     ------------------------------------------------------------------------ */

  /** Fil d’Ariane : Accueil / Kinshasa / catégorie / titre. */
  function rendreFil(f) {
    const cat = categorie(f.categorie);
    const chevron = icone('chevronRight');
    qs('#fil-ariano').innerHTML = `
      <a href="index.html">Accueil</a>${chevron}
      <a href="activites.html?ville=kinshasa">Kinshasa</a>${chevron}
      <a href="activites.html?cat=${encodeURIComponent(f.categorie)}">${esc(cat.nom)}</a>${chevron}
      <span aria-current="page">${esc(f.titre)}</span>`;
  }

  /** Bandeau de titre : nom, commune, note, prix, étiquettes. */
  function rendreTitre(f) {
    const cat = categorie(f.categorie);
    const dispo = disponibilite(f);

    qs('#fiche-titre').textContent = f.titre;
    qs('#fiche-resume').textContent = f.resume;

    qs('#fiche-meta').innerHTML = `
      <span class="cluster">${icone('pin')}<span>${esc(f.commune)} · ${esc(f.quartier)}</span></span>
      ${window.KEUI.note(f.note, f.avis)}
      <span class="cluster">
        <span class="caption">À partir de</span>
        ${window.KEUI.prix(f.aPartirDe)}
        <span class="caption">${esc(f.unite)}</span>
      </span>
      <span class="cluster">
        <span class="tag">${esc(cat.court)}</span>
        <span class="tag ${dispo.rare ? 'tag--brick' : 'tag--leaf'}">${esc(dispo.court)}</span>
      </span>`;
  }

  /** Galerie : image principale + vignettes cliquables, sans rechargement. */
  function rendreGalerie(f) {
    const images = f.galerie && f.galerie.length ? f.galerie : [f.image];
    const principale = qs('#galerie-principale');
    const vignettes = qs('#galerie-vignettes');

    // Transition douce : fondu court après le préchargement de la nouvelle image.
    principale.style.transition = 'opacity 260ms var(--ease-out)';

    const afficher = (src, rang) => {
      let fait = false;
      const finir = () => {
        if (fait) return;
        fait = true;
        clearTimeout(garde);
        principale.src = src;
        principale.alt = `${f.titre} — ${f.legende} (photographie ${rang + 1} sur ${images.length})`;
        principale.style.opacity = '1';
      };
      const garde = setTimeout(finir, 400); // filet de sécurité : jamais de galerie figée
      const pre = new Image();
      pre.onload = finir;
      pre.onerror = finir; // les visuels manquants restent affichables (maquette)
      pre.src = src;

      principale.style.opacity = '0';
      vignettes.querySelectorAll('.galerie__vignette').forEach((b, i) => {
        b.setAttribute('aria-current', String(i === rang));
      });
      qs('#galerie-legende').innerHTML =
        `<span>${esc(f.legende)}</span><span class="num">Photo ${rang + 1} / ${images.length}</span>`;
    };

    // Vignettes (une seule image : pas de vignettes, la légende reste)
    vignettes.innerHTML = images
      .map((src, i) => `
        <button class="galerie__vignette" type="button" data-rang="${i}" aria-current="false"
                aria-label="Afficher la photographie ${i + 1} sur ${images.length}">
          <img src="${src}" alt="" width="380" height="285" loading="lazy" decoding="async">
        </button>`)
      .join('');

    if (images.length < 2) vignettes.hidden = true;

    vignettes.addEventListener('click', (e) => {
      const btn = e.target.closest('.galerie__vignette');
      if (!btn) return;
      afficher(images[Number(btn.dataset.rang)], Number(btn.dataset.rang));
    });

    afficher(images[0], 0);
  }

  /** Corps de fiche : points forts, description, informations pratiques, avis. */
  function rendreCorps(f) {
    const p = f.pratique || {};
    const cat = categorie(f.categorie);

    /* Points forts */
    const forts = (f.fort || []).length
      ? `<section class="fiche-bloc" data-reveal>
           <h2>Ce qui distingue l’adresse</h2>
           <ul class="forts">
             ${f.fort.map((x) => `<li>${icone('check')}<span>${esc(x)}</span></li>`).join('')}
           </ul>
         </section>`
      : '';

    /* Description longue */
    const description = `
      <section class="fiche-bloc" id="description" data-reveal>
        <h2>L’adresse en détail</h2>
        ${paragraphes(f).map((t) => `<p>${esc(t)}</p>`).join('')}
      </section>`;

    /* Informations pratiques — table de définitions */
    const lignes = [
      ['Adresse', p.adresse],
      ['Horaires', p.horaires],
      ['Capacité', p.capacite],
      ['Langues', p.langues],
      ['Paiement accepté', (p.paiement || []).join(' · ')],
      ['Distance', p.distance]
    ].filter(([, v]) => v);

    const pratique = `
      <section class="fiche-bloc" data-reveal>
        <h2>Informations pratiques</h2>
        <dl class="pratique">
          ${lignes.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
          <div><dt>Type d’adresse</dt><dd>${esc(cat.nom)} · Kinshasa</dd></div>
        </dl>
      </section>`;

    /* Avis clients */
    const avis = (f.avisList || []).length
      ? `<section class="fiche-bloc" data-reveal>
           <h2>Avis des clients</h2>
           <ul class="avis-liste">
             ${f.avisList.map((a) => `
               <li class="avis-item">
                 <div class="avis-item__tete">
                   <span class="avis-item__auteur">${esc(a.auteur)}</span>
                   <span class="avis-item__date">${esc(a.date)}</span>
                 </div>
                 ${window.KEUI.note(a.note)}
                 <p class="avis-item__texte">« ${esc(a.texte)} »</p>
               </li>`).join('')}
           </ul>
           <p class="caption caption--phrase">Témoignages de démonstration, écrits pour la maquette et non issus de clients réels.</p>
         </section>`
      : '';

    qs('#fiche-corps').innerHTML = forts + description + pratique + avis;
  }

  /** Panneau collant : prix, unité, disponibilité, CTA, réassurance, paiement. */
  function rendrePanneau(f) {
    const dispo = disponibilite(f);
    const p = f.pratique || {};

    qs('#fiche-panneau').innerHTML = `
      <h2 class="panel__title" id="panneau-titre">Réserver</h2>
      <div class="stack">
        <p class="cluster">
          <span class="caption">À partir de</span>
          ${blocPrix(f)}
        </p>
        <dl class="lines">
          <div class="line"><dt>Disponibilité</dt><dd>${esc(dispo.court)}</dd></div>
          <div class="line"><dt>Adresse</dt><dd>${esc(p.adresse || f.commune)}</dd></div>
          <div class="line"><dt>Annulation</dt><dd>Sans frais jusqu’à 24 h avant</dd></div>
          <div class="line"><dt>Paiement accepté</dt><dd>${esc((p.paiement || []).join(' · '))}</dd></div>
        </dl>
        <p>
          <a class="btn btn--primaire btn--lg btn--block" href="reservation.html?id=${encodeURIComponent(f.id)}">
            ${esc(verbeReservation(f))}
          </a>
        </p>
        <p class="notice">${icone('shield')}
          <span>Le montant est retenu, pas versé : l’établissement n’est payé qu’après votre arrivée, et remboursé
          sous 72 heures en cas d’absence. Mobile money et carte sont acceptés au même rang.</span>
        </p>
        <p class="caption caption--phrase">Disponibilités et prix relevés pour la maquette — données fictives.</p>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     4. État vide : ?id= inconnu
     ------------------------------------------------------------------------ */
  function rendreIntrouvable(idDemande) {
    qs('#fiche-titre').textContent = 'Cette adresse n’est pas dans l’index';
    qs('#fiche-resume').textContent =
      'Le lien suivi ne correspond à aucune fiche ouverte. Voici par où reprendre la recherche.';
    qs('#fiche-meta').innerHTML =
      `<span class="cluster">${icone('info')}<span>Référence demandée : ${esc(idDemande)}</span></span>`;

    qs('#fiche-racine .fiche-layout').closest('section').hidden = true;
    const vide = qs('#fiche-introuvable');
    vide.hidden = false;

    // Trois entrées réelles pour repartir du bon pied.
    const suggestions = document.createElement('div');
    suggestions.className = 'wrap';
    suggestions.innerHTML =
      `<div class="head"><h2>Trois adresses pour reprendre</h2>
        <p class="head__meta">Les fiches les plus consultées cette semaine à Kinshasa.</p></div>
       <div class="entries">${KE.FICHES.slice(0, 3).map((f) => renduEntree(f)).join('')}</div>`;
    vide.parentElement.appendChild(suggestions);
  }

  /* ------------------------------------------------------------------------
     5. Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    const idDemande = param('id', '');
    const f = idDemande ? fiche(idDemande) : KE.FICHES[0];

    if (!f) {
      rendreIntrouvable(idDemande);
      return;
    }

    // Titre et description du document, alignés sur la fiche affichée.
    document.title = `${f.titre} — ${categorie(f.categorie).nom} à ${f.commune} | Kongo Explore`;
    const meta = qs('meta[name="description"]');
    if (meta) meta.setAttribute('content', f.resume);

    rendreFil(f);
    rendreTitre(f);
    rendreGalerie(f);
    rendreCorps(f);
    rendrePanneau(f);

    // Mouvement : les blocs entrent au défilement (jamais indispensable à la lecture).
    // NB : les données vivent dans la liaison globale `KE` (data.js) ; le
    // mouvement est exposé sur `window.KE.motion` (motion.js).
    if (window.KE && window.KE.motion && window.KE.motion.enregistrer()) {
      window.KE.motion.reveler('#fiche-corps .fiche-bloc', { y: 14, stagger: 0.05 });
    }
  });
})();