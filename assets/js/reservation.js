/* ==========================================================================
   Réservation — formulaire adapté au type de la fiche
   --------------------------------------------------------------------------
   La fiche vient de ?id=slug (repli : première fiche). Le formulaire, le
   récapitulatif et le total sont recalculés en direct, sans rechargement.
   Rien n’est inventé : chambres, créneaux, billets et séances viennent de KE.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, qsa, esc, param, icone, categorie, fiche, prix, note } = window.KEUI;

  /* ------------------------------------------------------------------------
     1. Utilitaires de date (toujours en heure locale : pas de décalage UTC)
     ------------------------------------------------------------------------ */
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const depuisIso = (s) => {
    const [a, m, j] = s.split('-').map(Number);
    return new Date(a, m - 1, j);
  };
  const AUJOURDHUI = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const joursFr = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  const dateFr = (s) => (s ? joursFr.format(depuisIso(s)) : '—');
  const ajouteJours = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  /* ------------------------------------------------------------------------
     2. État de la réservation
     ------------------------------------------------------------------------ */
  const etat = {
    arrivee: '', depart: '', nuits: 0, chambre: null, voyageurs: 2,
    date: '', creneau: null, mode: 'peu importe', personnes: 2,
    billets: {}, session: null, participants: 2
  };
  let tentative = false; // vrai après un premier clic sur CTA : les erreurs s’affichent
  let FICHE = null;

  /** Lecture / écriture d’un compteur, y compris un compteur de billets. */
  const lireCompteur = (id) => (id.indexOf('billet-') === 0 ? etat.billets[id.slice(7)] || 0 : etat[id]);
  const ecrireCompteur = (id, v) => {
    if (id.indexOf('billet-') === 0) etat.billets[id.slice(7)] = v;
    else etat[id] = v;
  };

  /** Bornes d’un compteur : les billets sont limités par leur stock restant. */
  function bornes(id) {
    if (id === 'voyageurs') return { min: 1, max: 6 };
    if (id === 'personnes') {
      const creneau = etat.creneau;
      const plafond = creneau && creneau.places ? Math.min(8, creneau.places) : 8;
      return { min: 1, max: plafond };
    }
    if (id === 'participants') {
      const plafond = etat.session && etat.session.places ? Math.min(8, etat.session.places) : 6;
      return { min: 1, max: plafond };
    }
    if (id.indexOf('billet-') === 0) {
      const b = FICHE.billets.find((x) => x.id === id.slice(7));
      return { min: 0, max: b ? b.restant : 0 };
    }
    return { min: 0, max: 99 };
  }

  /* ------------------------------------------------------------------------
     3. Fragments de formulaire
     ------------------------------------------------------------------------ */

  /** Compteur borné : deux boutons, une valeur, jamais de saisie libre. */
  function compteur(o) {
    const id = `val-${o.id}`;
    return `
      <div class="compteur" role="group" aria-labelledby="lib-${o.id}">
        <span class="compteur__label" id="lib-${o.id}">
          <span>${esc(o.libelle)}</span>
          <span>${esc(o.aide || '')}</span>
        </span>
        <span class="compteur__commandes">
          <button class="compteur__btn" type="button" data-compteur="${o.id}" data-pas="-1"
                   aria-label="Retirer un ${esc(o.element.toLowerCase())}"
                  ${lireCompteur(o.id) <= bornes(o.id).min ? 'disabled' : ''}>
            <span aria-hidden="true">−</span>
          </button>
          <output class="compteur__valeur num" id="${id}">${lireCompteur(o.id)}</output>
          <button class="compteur__btn" type="button" data-compteur="${o.id}" data-pas="1"
                   aria-label="Ajouter un ${esc(o.element.toLowerCase())}"
                  ${lireCompteur(o.id) >= bornes(o.id).max ? 'disabled' : ''}>
            <span aria-hidden="true">+</span>
          </button>
        </span>
      </div>`;
  }

  /** Choix exclusif dessiné (.check) avec prix, détail et stock restant. */
  function choixExclusif(o) {
    const complet = o.restant === 0;
    return `
      <label class="check">
        <input type="radio" name="${o.name}" value="${esc(o.value)}" ${complet ? 'disabled' : ''}>
        <span class="check__label">
          <span class="choix__tete">
            <span>${esc(o.titre)}</span>
            <span class="choix__prix">${prix(o.price, 'sm')}</span>
          </span>
          <span class="check__meta">${esc(o.details)}</span>
          <span class="check__meta">${complet ? 'Complet au relevé' : `${o.restant} ${esc(o.mot)}`}</span>
        </span>
      </label>`;
  }

  /** Créneau / séance : un bouton-radio avec heures et places libres. */
  function choixCreneau(o) {
    return `
      <label class="check">
        <input type="radio" name="${o.name}" value="${esc(o.value)}" ${o.places === 0 ? 'disabled' : ''}>
        <span class="creneau">
          <span class="creneau__nom">${esc(o.nom)}</span>
          <span class="creneau__h">${esc(o.heures)}</span>
          <span class="creneau__places">${o.places === 0 ? 'Complet' : `${o.places} ${esc(o.mot)} libres`}</span>
        </span>
      </label>`;
  }

  /* ------------------------------------------------------------------------
     4. Champs par type d’adresse
     ------------------------------------------------------------------------ */

  function champsHotel(f) {
    return `
      <fieldset class="fieldset">
        <legend>Dates du séjour</legend>
        <div class="dates">
          <div class="field">
            <label for="f-arrivee">Date d’arrivée</label>
            <input class="input" type="date" id="f-arrivee" name="arrivee" min="${iso(AUJOURDHUI)}"
                   value="${etat.arrivee}" aria-describedby="aide-arrivee">
            <p class="field__hint" id="aide-arrivee">Aujourd’hui ou plus tard.</p>
          </div>
          <div class="field">
            <label for="f-depart">Date de départ</label>
            <input class="input" type="date" id="f-depart" name="depart" min="${iso(ajouteJours(AUJOURDHUI, 1))}"
                   value="${etat.depart}" aria-describedby="nuits-hint">
            <p class="field__hint" id="nuits-hint">Le nombre de nuits est calculé automatiquement.</p>
            <p class="field__error" id="err-dates" hidden></p>
          </div>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Chambre</legend>
        <div class="choix">
          ${f.chambres.map((c) => choixExclusif({
            name: 'chambre', value: c.id, titre: c.nom, details: c.details,
            price: c.prix, restant: c.restant, mot: `chambre${c.restant > 1 ? 's' : ''} de ce type encore libre${c.restant > 1 ? 's' : ''}`
          })).join('')}
        </div>
        <p class="field__error" id="err-chambre" hidden></p>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Voyageurs</legend>
        ${compteur({
          id: 'voyageurs', libelle: 'Nombre de voyageurs', element: 'voyageur',
          aide: 'Entre 1 et 6 personnes par chambre', valeur: etat.voyageurs
        })}
        <p class="field__hint">Le prix de la chambre ne dépend pas du nombre de voyageurs.</p>
      </fieldset>`;
  }

  function champsRestaurant(f) {
    return `
      <fieldset class="fieldset">
        <legend>Date du repas</legend>
        <div class="field">
          <label for="f-date">Date</label>
          <input class="input" type="date" id="f-date" name="date" min="${iso(AUJOURDHUI)}"
                 value="${etat.date}" aria-describedby="aide-date">
          <p class="field__hint" id="aide-date">${esc(f.pratique.horaires)}</p>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Créneau</legend>
        <div class="creneaux">
          ${f.creneaux.map((c) => choixCreneau({
            name: 'creneau', value: c.id, nom: c.nom, heures: c.heures, places: c.places, mot: 'tables'
          })).join('')}
        </div>
        <p class="field__error" id="err-creneau" hidden></p>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Nombre de personnes</legend>
        ${compteur({
          id: 'personnes', libelle: 'Couverts', element: 'couvert',
          aide: 'Jusqu’à 8 personnes en ligne', valeur: etat.personnes
        })}
        <p class="field__hint">Au-delà de 8 couverts, la salle se contacte directement pour un groupe.</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Où s’installer</legend>
        <div class="field">
          <label for="f-mode">Terrasse ou salle</label>
          <select class="select" id="f-mode" name="mode" aria-describedby="aide-mode">
            <option value="peu importe"${etat.mode === 'peu importe' ? ' selected' : ''}>Peu importe, selon la place libre</option>
            <option value="terrasse"${etat.mode === 'terrasse' ? ' selected' : ''}>Terrasse</option>
            <option value="salle"${etat.mode === 'salle' ? ' selected' : ''}>En salle</option>
          </select>
          <p class="field__hint" id="aide-mode">La précision est transmise à la salle ; elle reste soumise aux tables disponibles ce jour-là.</p>
        </div>
      </fieldset>`;
  }

  function champsCafe(f) {
    return `
      <fieldset class="fieldset">
        <legend>Date</legend>
        <div class="field">
          <label for="f-date">Date</label>
          <input class="input" type="date" id="f-date" name="date" min="${iso(AUJOURDHUI)}"
                 value="${etat.date}" aria-describedby="aide-date">
          <p class="field__hint" id="aide-date">${esc(f.pratique.horaires)}</p>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Créneau</legend>
        <div class="creneaux">
          ${f.creneaux.map((c) => choixCreneau({
            name: 'creneau', value: c.id, nom: c.nom, heures: c.heures, places: c.places, mot: 'places'
          })).join('')}
        </div>
        <p class="field__error" id="err-creneau" hidden></p>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Nombre de personnes</legend>
        ${compteur({
          id: 'personnes', libelle: 'Places demandées', element: 'place',
          aide: 'Jusqu’à 8 personnes en ligne', valeur: etat.personnes
        })}
      </fieldset>`;
  }

  function champsEvenement(f) {
    return `
      <fieldset class="fieldset">
        <legend>Date de l’événement</legend>
        <div class="field">
          <label for="f-date">Date</label>
          <input class="input" type="date" id="f-date" name="date" min="${iso(AUJOURDHUI)}"
                 value="${etat.date}" aria-describedby="aide-date">
          <p class="field__hint" id="aide-date">${esc(f.pratique.horaires)}</p>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Billets</legend>
        <div class="choix">
          ${f.billets.map((b) => `
            <div class="compteur" role="group" aria-labelledby="lib-billet-${b.id}">
              <span class="compteur__label" id="lib-billet-${b.id}">
                <span class="choix__tete">
                  <span>${esc(b.nom)}</span>
                  <span class="choix__prix">${prix(b.prix, 'sm')}</span>
                </span>
                <span class="choix__detail">${esc(b.details)}</span>
                <span class="choix__detail">${b.restant} billets restants</span>
              </span>
              <span class="compteur__commandes">
                <button class="compteur__btn" type="button" data-compteur="billet-${b.id}" data-pas="-1"
                         aria-label="Retirer un billet ${esc(b.nom.toLowerCase())}"
                        ${lireCompteur('billet-' + b.id) <= 0 ? 'disabled' : ''}>
                  <span aria-hidden="true">−</span>
                </button>
                <output class="compteur__valeur num" id="val-billet-${b.id}">${lireCompteur('billet-' + b.id)}</output>
                <button class="compteur__btn" type="button" data-compteur="billet-${b.id}" data-pas="1"
                         aria-label="Ajouter un billet ${esc(b.nom.toLowerCase())}"
                        ${lireCompteur('billet-' + b.id) >= b.restant ? 'disabled' : ''}>
                  <span aria-hidden="true">+</span>
                </button>
              </span>
            </div>`).join('')}
        </div>
        <p class="field__error" id="err-billets" hidden></p>
      </fieldset>`;
  }

  function champsExperience(f) {
    return `
      <fieldset class="fieldset">
        <legend>Séance</legend>
        <div class="creneaux">
          ${f.sessions.map((s) => choixCreneau({
            name: 'session', value: s.id, nom: s.nom, heures: s.heures, places: s.places, mot: 'places'
          })).join('')}
        </div>
        <p class="field__error" id="err-creneau" hidden></p>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Participants</legend>
        ${compteur({
          id: 'participants', libelle: 'Nombre de participants', element: 'participant',
          aide: 'Groupe réduit, encadré par un guide', valeur: etat.participants
        })}
      </fieldset>

      <p class="notice">${icone('pin')}
        <span><b>Point de rendez-vous :</b> ${esc(f.pratique.adresse)}. ${esc(f.pratique.distance)}.
        Présentez-vous dix minutes avant l’heure de la séance.</span>
      </p>`;
  }

  const CHAMPS = {
    hotel: champsHotel, restaurant: champsRestaurant, cafe: champsCafe,
    evenement: champsEvenement, experience: champsExperience
  };

  /* ------------------------------------------------------------------------
     5. Calcul du total
     ------------------------------------------------------------------------ */
  function totalUsd() {
    const f = FICHE;
    if (f.categorie === 'hotel') {
      return etat.chambre && etat.nuits > 0 ? etat.chambre.prix.usd * etat.nuits : 0;
    }
    if (f.categorie === 'evenement') {
      return f.billets.reduce((t, b) => t + (etat.billets[b.id] || 0) * b.prix.usd, 0);
    }
    if (f.categorie === 'restaurant') return etat.personnes * (f.aPartirDe.usd / 2);
    if (f.categorie === 'cafe') return etat.personnes * f.aPartirDe.usd;
    return etat.participants * f.aPartirDe.usd;
  }

  /* ------------------------------------------------------------------------
     6. Contrôle de complétude : chaque manque est nommé, avec sa récupération
     ------------------------------------------------------------------------ */
  function manques() {
    const f = FICHE;
    const m = [];
    if (f.categorie === 'hotel') {
      if (!etat.arrivee) m.push('la date d’arrivée');
      if (!etat.depart) m.push('la date de départ');
      if (etat.arrivee && etat.depart && etat.nuits <= 0) m.push('des dates cohérentes, le départ devant suivre l’arrivée');
      if (!etat.chambre) m.push('une chambre');
    }
    if (f.categorie === 'restaurant' || f.categorie === 'cafe') {
      if (!etat.date) m.push('la date');
      if (!etat.creneau) m.push('un créneau');
      if (etat.creneau && etat.personnes > etat.creneau.places) {
        m.push(`un nombre de personnes tenant dans le créneau (${etat.creneau.places} places restantes)`);
      }
    }
    if (f.categorie === 'evenement') {
      if (!etat.date) m.push('la date');
      const n = f.billets.reduce((t, b) => t + (etat.billets[b.id] || 0), 0);
      if (n === 0) m.push('au moins un billet');
    }
    if (f.categorie === 'experience') {
      if (!etat.session) m.push('une séance');
      if (etat.session && etat.participants > etat.session.places) {
        m.push(`un nombre de participants tenant dans la séance (${etat.session.places} places restantes)`);
      }
    }
    return m;
  }

  /* ------------------------------------------------------------------------
     7. Récapitulatif vivant
     ------------------------------------------------------------------------ */
  function lignesRecap() {
    const f = FICHE;
    const l = [];
    const prixHtml = (n) => prix(KE.priceOf(n), 'sm');

    if (f.categorie === 'hotel') {
      l.push(['Chambre', etat.chambre ? esc(etat.chambre.nom) : '<span class="caption">À choisir</span>']);
      l.push(['Arrivée', etat.arrivee ? esc(dateFr(etat.arrivee)) : '<span class="caption">À choisir</span>']);
      l.push(['Départ', etat.depart ? esc(dateFr(etat.depart)) : '<span class="caption">À choisir</span>']);
      l.push(['Nuits', etat.nuits > 0 ? `<span class="num">${etat.nuits}</span>` : '<span class="caption">—</span>']);
      l.push(['Voyageurs', `<span class="num">${etat.voyageurs}</span>`]);
      if (etat.chambre && etat.nuits > 0) {
        l.push([`${etat.nuits} nuit${etat.nuits > 1 ? 's' : ''} × ${etat.chambre.prix.usd} $`, prixHtml(etat.chambre.prix.usd * etat.nuits)]);
      }
    } else if (f.categorie === 'restaurant' || f.categorie === 'cafe') {
      const unite = f.categorie === 'restaurant' ? 'tables' : 'places';
      l.push(['Date', etat.date ? esc(dateFr(etat.date)) : '<span class="caption">À choisir</span>']);
      l.push(['Créneau', etat.creneau ? `${esc(etat.creneau.nom)}<br><span class="caption">${esc(etat.creneau.heures)}</span>` : '<span class="caption">À choisir</span>']);
      l.push(['Personnes', `<span class="num">${etat.personnes}</span>`]);
      l.push(['Places au créneau', etat.creneau ? `<span class="num">${etat.creneau.places} ${esc(unite)}</span>` : '<span class="caption">—</span>']);
      if (f.categorie === 'restaurant') l.push(['Service', esc(etat.mode === 'peu importe' ? 'Selon la place libre' : etat.mode === 'terrasse' ? 'Terrasse' : 'En salle')]);
      l.push([`${etat.personnes} personne${etat.personnes > 1 ? 's' : ''}`, prixHtml(totalUsd())]);
    } else if (f.categorie === 'evenement') {
      l.push(['Date', etat.date ? esc(dateFr(etat.date)) : '<span class="caption">À choisir</span>']);
      const choisis = f.billets.filter((b) => (etat.billets[b.id] || 0) > 0);
      if (!choisis.length) {
        l.push(['Billets', '<span class="caption">À choisir</span>']);
      } else {
        choisis.forEach((b) => {
          const n = etat.billets[b.id];
          l.push([`${esc(b.nom)} × ${n}`, prixHtml(b.prix.usd * n)]);
        });
      }
    } else {
      l.push(['Séance', etat.session ? `${esc(etat.session.nom)}<br><span class="caption">${esc(etat.session.heures)}</span>` : '<span class="caption">À choisir</span>']);
      l.push(['Participants', `<span class="num">${etat.participants}</span>`]);
      l.push(['Rendez-vous', esc(f.pratique.adresse)]);
    }
    return l;
  }

  function majRecap() {
    const f = FICHE;
    const m = manques();
    const complet = m.length === 0;
    const total = totalUsd();
    const lignes = lignesRecap();

    const uniteTotal = {
      hotel: etat.nuits > 1 ? ` · ${etat.nuits} nuits` : etat.nuits === 1 ? ' · 1 nuit' : '',
      evenement: ' · billets',
      experience: '',
      restaurant: '',
      cafe: ''
    }[f.categorie] || '';

    qs('#recap').innerHTML =
      lignes.map(([k, v]) => `<div class="line"><dt>${k}</dt><dd>${v}</dd></div>`).join('') +
      `<div class="line line--total">
         <dt>Total${uniteTotal}</dt>
         <dd>${complet ? prix(KE.priceOf(total)) : '<span class="caption">À compléter</span>'}</dd>
       </div>`;

    // Le CTA ne s’active que lorsque tout est renseigné.
    const cta = qs('#cta-paiement');
    const err = qs('#resa-erreur');
    cta.setAttribute('aria-disabled', String(!complet));
    cta.href = urlPaiement();

    if (complet) {
      err.hidden = true;
      err.textContent = '';
      qs('#recap-annonce').textContent = `Total ${total} $, soit ${KE.cdf(total)}.`;
    } else {
      err.innerHTML = `${icone('info')}<span>Sélection incomplète : il manque ${esc(lister(m))}. Le bouton s’activera dès que tout sera renseigné.</span>`;
      err.hidden = !tentative;
    }

    // Erreurs locales, affichées sur les champs concernés.
    const errDates = qs('#err-dates');
    if (errDates) {
      const invalide = etat.arrivee && etat.depart && etat.nuits <= 0;
      errDates.hidden = !invalide;
      errDates.innerHTML = invalide
        ? `${icone('info')}<span>La date de départ doit être postérieure à la date d’arrivée (${esc(dateFr(etat.arrivee))}). Choisissez ${esc(dateFr(iso(ajouteJours(depuisIso(etat.arrivee), 1))))} ou plus tard.</span>`
        : '';
      qs('#f-depart').setAttribute('aria-invalid', String(Boolean(invalide)));
    }
    const errChambre = qs('#err-chambre');
    if (errChambre) {
      const invalide = tentative && !etat.chambre;
      errChambre.hidden = !invalide;
      errChambre.textContent = invalide ? 'Choisissez une chambre dans la liste ci-dessus pour continuer.' : '';
    }
    const errCreneau = qs('#err-creneau');
    if (errCreneau) {
      const invalide = tentative && !etat.creneau;
      errCreneau.hidden = !invalide;
      errCreneau.textContent = 'Sélectionnez un créneau pour continuer, ou choisissez une autre date si tout est complet.';
    }
    const errBillets = qs('#err-billets');
    if (errBillets) {
      const invalide = tentative && f.billets.every((b) => !(etat.billets[b.id] > 0));
      errBillets.hidden = !invalide;
      errBillets.textContent = 'Ajoutez au moins un billet avec les boutons « + » pour continuer.';
    }
  }

  /** « a, b et c » — une phrase lisible pour l’erreur du CTA. */
  function lister(arr) {
    if (arr.length === 1) return arr[0];
    return `${arr.slice(0, -1).join(', ')} et ${arr[arr.length - 1]}`;
  }

  /** URL du paiement : la fiche, la sélection exacte et le total. */
  function urlPaiement() {
    const f = FICHE;
    const p = new URLSearchParams();
    p.set('id', f.id);
    p.set('type', f.categorie);
    p.set('total', String(totalUsd()));

    if (f.categorie === 'hotel') {
      p.set('arrivee', etat.arrivee);
      p.set('depart', etat.depart);
      p.set('nuits', String(etat.nuits));
      p.set('chambre', etat.chambre ? etat.chambre.id : '');
      p.set('voyageurs', String(etat.voyageurs));
    } else if (f.categorie === 'restaurant' || f.categorie === 'cafe') {
      p.set('date', etat.date);
      p.set('creneau', etat.creneau ? etat.creneau.id : '');
      p.set('personnes', String(etat.personnes));
      if (f.categorie === 'restaurant') p.set('mode', etat.mode);
    } else if (f.categorie === 'evenement') {
      p.set('date', etat.date);
      p.set('billets', f.billets.filter((b) => etat.billets[b.id] > 0).map((b) => `${b.id}:${etat.billets[b.id]}`).join(','));
    } else {
      p.set('session', etat.session ? etat.session.id : '');
      p.set('participants', String(etat.participants));
    }
    return `paiement.html?${p.toString()}`;
  }

  /* ------------------------------------------------------------------------
     8. Mise à jour des compteurs (valeur, bornes, boutons)
     ------------------------------------------------------------------------ */
  function majCompteurs() {
    qsa('[data-compteur]').forEach((btn) => {
      const id = btn.dataset.compteur;
      const b = bornes(id);
      const v = Math.min(Math.max(lireCompteur(id), b.min), b.max);
      ecrireCompteur(id, v);

      const sortie = document.getElementById(`val-${id}`);
      if (sortie) sortie.textContent = String(v);

      const plus = v >= b.max;
      const moins = v <= b.min;
      if (btn.dataset.pas === '1') btn.disabled = plus;
      else btn.disabled = moins;
    });
  }

  /** Bandeau de titre : fil d’Ariane, titre, accroche, méta. */
  function rendreEntete(f) {
    const cat = categorie(f.categorie);
    const chevron = icone('chevronRight');

    document.title = `Réserver ${f.titre} — ${cat.nom} à ${f.commune} | Kongo Explore`;
    const meta = qs('meta[name="description"]');
    if (meta) meta.setAttribute('content', `Réservation de ${f.titre}, ${cat.nom.toLowerCase()} à ${f.commune} (Kinshasa) : ${f.resume}`);

    qs('#fil-ariano').innerHTML = `
      <a href="index.html">Accueil</a>${chevron}
      <a href="activites.html?ville=kinshasa">Kinshasa</a>${chevron}
      <a href="activites.html?cat=${encodeURIComponent(f.categorie)}">${esc(cat.nom)}</a>${chevron}
      <a href="fiche.html?id=${encodeURIComponent(f.id)}">${esc(f.titre)}</a>${chevron}
      <span aria-current="page">Réservation</span>`;

    const accroches = {
      hotel: 'Vous choisissez vos dates et votre chambre : le nombre de nuits et le total se recalculent sans recharger la page.',
      restaurant: 'Vous choisissez le service et le nombre de couverts ; le total se met à jour à chaque changement.',
      cafe: 'Vous choisissez une plage horaire et le nombre de places.',
      evenement: 'Vous choisissez vos billets à l’unité ; le total se recalcule à chaque billet ajouté.',
      experience: 'Vous choisissez une séance et le nombre de participants ; le point de rendez-vous est rappelé ci-dessous.'
    };
    qs('#resa-titre').textContent = `Réserver · ${f.titre}`;
    qs('#resa-lede').textContent = `${accroches[f.categorie]} Trois étapes, et rien n’est débité avant votre arrivée.`;

    qs('#resa-meta').innerHTML = `
      <span class="cluster">${icone('pin')}<span>${esc(f.commune)} · ${esc(f.quartier)}</span></span>
      ${note(f.note, f.avis)}
      <span class="cluster">
        <span class="caption">À partir de</span>
        ${prix(f.aPartirDe)}
        <span class="caption">${esc(f.unite)}</span>
      </span>
      <span class="cluster">
        <a class="link-arrow" href="fiche.html?id=${encodeURIComponent(f.id)}">Revoir la fiche ${icone('arrowRight')}</a>
      </span>`;
  }

  /* ------------------------------------------------------------------------
     9. Démarrage
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    const idDemande = param('id', '');
    FICHE = idDemande ? fiche(idDemande) : KE.FICHES[0];

    if (!FICHE) {
      qs('#resa-titre').textContent = 'Réservation impossible';
      qs('#resa-racine .resa-layout').closest('section').hidden = true;
      qs('#resa-introuvable').hidden = false;
      document.title = 'Réservation introuvable — Kongo Explore';
      return;
    }

    // Pré-remplissage depuis l’URL (la fiche est le seul point d’entrée normal,
    // mais les paramètres permettent de reprendre une sélection).
    const modeUrl = param('mode', '');
    if (modeUrl) etat.mode = modeUrl;

    rendreEntete(FICHE);
    qs('#resa-champs').innerHTML = CHAMPS[FICHE.categorie](FICHE);
    majCompteurs();
    majRecap();

    const form = qs('#resa-form');

    /* Choix exclusifs, dates, sélecteur de salle */
    form.addEventListener('change', (e) => {
      const t = e.target;

      if (t.name === 'chambre') etat.chambre = FICHE.chambres.find((c) => c.id === t.value) || null;
      if (t.name === 'creneau') {
        etat.creneau = FICHE.creneaux.find((c) => c.id === t.value) || null;
        etat.personnes = Math.min(etat.personnes, bornes('personnes').max); // le créneau borne les couverts
      }
      if (t.name === 'session') etat.session = FICHE.sessions.find((s) => s.id === t.value) || null;
      if (t.name === 'mode') etat.mode = t.value;
      if (t.name === 'date') etat.date = t.value;

      if (t.name === 'arrivee' || t.name === 'depart') {
        etat[t.name] = t.value;
        if (etat.arrivee) {
          // Le sélecteur de départ propose le lendemain de l’arrivée au minimum.
          // Une date saisie à la main reste affichée : elle est signalée en erreur
          // sous le champ plutôt que corrigée en silence.
          qs('#f-depart').min = iso(ajouteJours(depuisIso(etat.arrivee), 1));
        }
        etat.nuits = etat.arrivee && etat.depart
          ? Math.round((depuisIso(etat.depart) - depuisIso(etat.arrivee)) / 86400000)
          : 0;
        const hint = qs('#nuits-hint');
        if (hint) {
          hint.textContent = etat.nuits > 1
            ? `${etat.nuits} nuits, du ${dateFr(etat.arrivee)} au ${dateFr(etat.depart)}.`
            : etat.nuits === 1
              ? `1 nuit, du ${dateFr(etat.arrivee)} au ${dateFr(etat.depart)}.`
              : 'Le nombre de nuits est calculé automatiquement.';
        }
      }

      majCompteurs();
      majRecap();
    });

    /* Compteurs bornés */
    form.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-compteur]');
      if (!btn) return;
      const id = btn.dataset.compteur;
      const b = bornes(id);
      const v = Math.min(Math.max(lireCompteur(id) + Number(btn.dataset.pas), b.min), b.max);
      ecrireCompteur(id, v);
      majCompteurs();
      majRecap();
    });

    /* CTA : jamais actif tant qu’il manque un choix */
    qs('#cta-paiement').addEventListener('click', (e) => {
      if (qs('#cta-paiement').getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        tentative = true;
        majRecap();
        const err = qs('#resa-erreur');
        err.hidden = false;
        err.setAttribute('tabindex', '-1');
        err.focus(); // on amène l’utilisateur au message qui explique quoi faire
      }
    });

    // Mouvement : entrée sobre des blocs du formulaire.
    // NB : `KE` = données (data.js), `window.KE.motion` = mouvement (motion.js).
    if (window.KE && window.KE.motion && window.KE.motion.enregistrer()) {
      window.KE.motion.reveler('#resa-champs > *', { y: 12, stagger: 0.05 });
    }
  });
})();