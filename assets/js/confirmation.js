/* ==========================================================================
   Confirmation — reçu, étapes suivantes et ajout au calendrier
   --------------------------------------------------------------------------
   · reprend la référence et la réservation transmises par paiement.html
     (confirmation.html?ref=KE-2026-XXXX&id=…&mode=…&debut=…&fin=…&option=…
      &qte=…&total=…&moyen=…) et retombe sur des valeurs cohérentes sinon ;
   · dresse le reçu (établissement, commune, date et heure, détail, montants
     US$ et CDF, moyen de paiement, numéro de réservation) ;
   · génère un fichier .ics dans le navigateur : le calendrier reste une
     démonstration, aucun serveur n’est appelé.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, esc, param, icone, fiche, prix, montant } = window.KEUI;

  /* motion.js étend window.KE ; data.js expose la constante KE. */
  const motion = (window.KE && window.KE.motion) || null;

  const ANNEE = new Date().getFullYear();
  const COMMISSION = 0.05;

  /* ------------------------------------------------------------------------
     1. Utilitaires — mêmes règles que paiement.js
     ------------------------------------------------------------------------ */

  const dollars = (n) =>
    `${montant(n)} $`;

  /** Montant d’une ligne de reçu : dollars US puis équivalent en francs. */
  const montantLigne = (n) =>
    `<span class="num">${dollars(n)}</span> <span class="price__cdf">≈ ${KE.cdf(n)}</span>`;

  function lireDate(valeur) {
    if (!valeur) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valeur));
    const d = iso ? new Date(+iso[1], +iso[2] - 1, +iso[3], 12) : new Date(valeur);
    return isNaN(d.getTime()) ? null : d;
  }

  function dans(n) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  }

  const dateLongue = (d) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const heureCourte = (d) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

  function entier(valeur, defaut) {
    const n = parseInt(String(valeur), 10);
    return isFinite(n) && n > 0 ? n : defaut;
  }

  function nombre(valeur, defaut) {
    const n = parseFloat(String(valeur).replace(',', '.'));
    return isFinite(n) && n > 0 ? n : defaut;
  }

  const premierParam = (...noms) => {
    for (const nom of noms) {
      const v = param(nom, '');
      if (v) return v;
    }
    return '';
  };

  /* ------------------------------------------------------------------------
     2. Réservation transmise par paiement.html
     ------------------------------------------------------------------------ */

  const f = fiche(param('id', '')) || fiche('residence-salongo') || KE.FICHES[0];

  function choixDe(ficheCourante) {
    if (ficheCourante.chambres) return { liste: ficheCourante.chambres, libelle: 'Chambre' };
    if (ficheCourante.billets) return { liste: ficheCourante.billets, libelle: 'Billet' };
    if (ficheCourante.sessions) return { liste: ficheCourante.sessions, libelle: 'Séance' };
    if (ficheCourante.creneaux) return { liste: ficheCourante.creneaux, libelle: 'Créneau' };
    return { liste: [], libelle: 'Formule' };
  }

  const QUANTITE_DEFAUT = { hotel: 1, restaurant: 2, cafe: 1, evenement: 1, experience: 2 };
  const LIBELLE_QUANTITE = { hotel: 'Chambres réservées', restaurant: 'Couverts', cafe: 'Places', evenement: 'Billets', experience: 'Participants' };

  const mode = premierParam('mode') || f.categorie;
  const choix = choixDe(f);
  const idOption = premierParam('option', 'chambre', 'billet', 'seance', 'creneau', 'formule');
  const option = choix.liste.find((o) => o.id === idOption) || choix.liste[0] || null;
  const quantite = entier(premierParam('qte', 'quantite', 'personnes', 'voyageurs', 'places', 'couverts'), QUANTITE_DEFAUT[mode] || 1);

  const debut = lireDate(premierParam('debut', 'arrivee', 'date')) || dans(mode === 'hotel' ? 1 : 2);
  const fin = mode === 'hotel' ? lireDate(premierParam('fin', 'depart')) || dans(3) : null;
  const nuits = mode === 'hotel' ? Math.max(1, Math.round((fin - debut) / 86400000)) : 1;

  // Les créneaux et les séances n’ont pas de prix propre : on retombe alors sur
  // le « à partir de » de la fiche.
  const prixUnitaire = option && option.prix ? option.prix.usd : f.aPartirDe.usd;
  const sousTotal = Math.round(nombre(premierParam('total'), prixUnitaire * quantite * nuits) * 100) / 100;
  const commission = Math.round(sousTotal * COMMISSION * 100) / 100;
  const total = Math.round((sousTotal + commission) * 100) / 100;

  /* Moyen de paiement retenu (aucun numéro ne circule : seul l’identifiant passe). */
  const moyen = KE.PAIEMENTS.find((p) => p.id === premierParam('moyen')) || KE.PAIEMENTS[0];
  const surPlace = moyen.type === 'cash';

  /* Référence : celle de l’URL, sinon une référence d’exemple annoncée comme telle. */
  const referenceTransmise = premierParam('ref');
  const reference = referenceTransmise || referenceExemple();

  function referenceExemple() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const octets = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(octets);
    else for (let i = 0; i < 4; i++) octets[i] = Math.floor(Math.random() * 256);
    let suffixe = '';
    for (let i = 0; i < 4; i++) suffixe += alphabet[octets[i] % alphabet.length];
    return `KE-${ANNEE}-${suffixe}`;
  }

  /* ------------------------------------------------------------------------
     3. Reçu
     ------------------------------------------------------------------------ */

  /** Date et heure du rendez-vous, selon le format de réservation. */
  function quand() {
    if (mode === 'hotel') {
      return `${dateLongue(debut)} → ${dateLongue(fin)} · arrivée à partir de 14 h, départ avant 11 h`;
    }
    const heures = option && option.heures ? option.heures : f.pratique.horaires;
    return `${dateLongue(debut)} · ${heures}`;
  }

  function rendreRecu() {
    const cible = qs('#recu-lignes');
    if (!cible) return;

    const lignes = [
      `<div class="line"><dt>Établissement</dt><dd>${esc(f.titre)}</dd></div>`,
      `<div class="line"><dt>Commune</dt><dd>${esc(f.commune)} · ${esc(f.quartier)}</dd></div>`,
      `<div class="line"><dt>Adresse</dt><dd>${esc(f.pratique.adresse)}</dd></div>`,
      `<div class="line"><dt>Date et heure</dt><dd>${esc(quand())}</dd></div>`
    ];

    if (option) {
      lignes.push(`<div class="line"><dt>${esc(choix.libelle)}</dt><dd>${esc(option.nom)}</dd></div>`);
    }
    lignes.push(`<div class="line"><dt>${esc(LIBELLE_QUANTITE[mode] || 'Quantité')}</dt><dd><span class="num">${quantite}</span></dd></div>`);
    if (mode === 'hotel') {
      lignes.push(`<div class="line"><dt>Nuits</dt><dd><span class="num">${nuits}</span></dd></div>`);
    }

    lignes.push(`<div class="line"><dt>Sous-total réservation</dt><dd>${montantLigne(sousTotal)}</dd></div>`);
    lignes.push(`<div class="line"><dt>Commission de service (5 %)</dt><dd>${montantLigne(commission)}</dd></div>`);
    lignes.push(`<div class="line"><dt>Moyen de paiement</dt><dd>${esc(moyen.nom)}</dd></div>`);

    const libelleTotal = surPlace ? 'Montant à régler sur place' : 'Montant total payé';
    lignes.push(`<div class="line line--total"><dt>${libelleTotal}</dt><dd>${prix({ usd: total })}</dd></div>`);
    lignes.push(`<div class="line"><dt>Numéro de réservation</dt><dd>${esc(reference)}</dd></div>`);

    cible.innerHTML = lignes.join('');

    const note = qs('#recu-note');
    if (note) {
      note.textContent = surPlace
        ? `Rien n’a été débité : le montant est réglé à l’établissement, en dollars ou en francs congolais (${KE.cdf(total)}).`
        : `Montant retenu jusqu’à votre arrivée, puis versé à l’établissement. Remboursement sous 72 heures en cas d’absence.`;
    }
  }

  /* ------------------------------------------------------------------------
     4. Étapes suivantes
     ------------------------------------------------------------------------ */

  function rendreEtapes() {
    const cible = qs('#etapes-suivantes');
    if (!cible) return;

    const etapes = [
      {
        icone: 'phone',
        titre: 'Le reçu part par SMS',
        texte: surPlace
          ? 'En situation réelle, un message de rappel partirait vers votre numéro avec la référence et l’adresse. Dans cette maquette, aucun SMS n’est envoyé.'
          : 'En situation réelle, un message partirait vers le numéro utilisé pour le paiement, avec la référence, l’adresse et l’heure. Dans cette maquette, aucun SMS n’est envoyé.'
      },
      {
        icone: 'check',
        titre: 'Présenter la référence à l’arrivée',
        texte: `Une pièce d’identité suffit. La référence ${reference} est la seule chose à montrer : elle est reliée à la réservation enregistrée sur cette page.`
      },
      {
        icone: 'pin',
        titre: `Joindre ${f.titre}`,
        texte: `${f.pratique.adresse} — ${f.pratique.horaires}. Langues parlées sur place : ${f.pratique.langues}.`
      }
    ];

    cible.innerHTML = etapes
      .map(
        (e) => `
        <li>
          ${icone(e.icone)}
          <span>
            <b>${esc(e.titre)}</b>
            <br>${esc(e.texte)}
          </span>
        </li>`
      )
      .join('');
  }

  /* ------------------------------------------------------------------------
     5. Ajout au calendrier : un .ics fabriqué dans la page
     ------------------------------------------------------------------------ */

  const pad = (n) => String(n).padStart(2, '0');
  const dateIcs = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const dateHeureIcs = (d) => `${dateIcs(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const echapperIcs = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');

  /** Heures du créneau choisi, sinon 19 h, sinon une journée entière. */
  function debutEtFin() {
    if (mode === 'hotel') {
      const depart = new Date(debut);
      depart.setHours(14, 0, 0, 0);
      // Pour un événement « journée entière », DTEND est exclusif : on sort le
      // lendemain du départ pour que la nuit du dernier jour soit couverte.
      const arrivee = new Date(fin);
      arrivee.setDate(arrivee.getDate() + 1);
      arrivee.setHours(11, 0, 0, 0);
      return { debut: depart, fin: arrivee, journee: true };
    }
    const heures = option && option.heures ? option.heures : '';
    const trouves = heures.match(/(\d{1,2})\s*h\s*(\d{2})?/g) || [];
    const lire = (texte, defautH, defautM) => {
      const m = /(\d{1,2})\s*h\s*(\d{2})?/.exec(texte || '');
      return m ? { h: +m[1], m: m[2] ? +m[2] : 0 } : { h: defautH, m: defautM };
    };
    const depart = lire(trouves[0], 19, 0);
    const arrivee = lire(trouves[1], depart.h + 2, depart.m);
    const d1 = new Date(debut);
    d1.setHours(depart.h, depart.m, 0, 0);
    const d2 = new Date(debut);
    d2.setHours(arrivee.h, arrivee.m, 0, 0);
    return { debut: d1, fin: d2, journee: false };
  }

  /** Contenu complet du fichier .ics (RFC 5545, retours CRLF). */
  function contenuIcs() {
    const { debut: d1, fin: d2, journee } = debutEtFin();
    const finAffichee = d2 <= d1 ? new Date(d1.getTime() + 2 * 3600000) : d2;
    const description =
      `Réservation ${reference} — Kongo Explore (maquette de démonstration). ` +
      `${option ? choix.libelle + ' : ' + option.nom + '. ' : ''}` +
      `${LIBELLE_QUANTITE[mode] || 'Quantité'} : ${quantite}. ` +
      `Montant : ${dollars(total)} (${KE.cdf(total)}), ${moyen.nom}. ` +
      `Aucun paiement réel n’a été traité.`;

    const lignes = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kongo Explore//Maquette//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${reference}@kongo-explore.maquette`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      journee ? `DTSTART;VALUE=DATE:${dateIcs(d1)}` : `DTSTART:${dateHeureIcs(d1)}`,
      journee ? `DTEND;VALUE=DATE:${dateIcs(finAffichee)}` : `DTEND:${dateHeureIcs(finAffichee)}`,
      `SUMMARY:${echapperIcs(f.titre + ' — Kongo Explore (réservation ' + reference + ')')}`,
      `LOCATION:${echapperIcs(f.pratique.adresse + ', ' + f.commune + ', Kinshasa')}`,
      `DESCRIPTION:${echapperIcs(description)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lignes.join('\r\n') + '\r\n';
  }

  function initCalendrier() {
    const lien = qs('#lien-calendrier');
    const aide = qs('#aide-calendrier');
    if (!lien) return;

    const indisponible = !(window.Blob && window.URL && window.URL.createObjectURL);

    if (indisponible) {
      // Repli explicite : on annonce que le fichier ne peut pas être fabriqué.
      lien.setAttribute('aria-disabled', 'true');
      lien.removeAttribute('download');
      lien.setAttribute('href', 'confirmation.html');
      if (aide) {
        aide.textContent = 'Votre navigateur ne permet pas de fabriquer le fichier de calendrier : la date reste rappelée dans le reçu ci-dessus.';
      }
      return;
    }

    let url = '';
    try {
      const blob = new Blob([contenuIcs()], { type: 'text/calendar;charset=utf-8' });
      url = URL.createObjectURL(blob);
    } catch (e) {
      if (aide) aide.textContent = 'Le fichier de calendrier n’a pas pu être fabriqué par le navigateur.';
      return;
    }

    lien.setAttribute('href', url);
    lien.setAttribute('download', `${reference}.ics`);
    if (aide) {
      aide.textContent = `Fichier .ics fabriqué dans votre navigateur à partir des données de la maquette (${reference}.ics). Importez-le dans Google Agenda, Outlook ou Calendrier Apple.`;
    }
    lien.addEventListener('click', () => {
      if (aide) aide.textContent = `Téléchargement de ${reference}.ics lancé. Ce fichier est une démonstration : il ne réserve rien à lui seul.`;
    });
  }

  /* ------------------------------------------------------------------------
     6. Démarrage
     ------------------------------------------------------------------------ */

  function init() {
    const zoneReference = qs('#reference');
    if (zoneReference) zoneReference.textContent = reference;

    // Reçu et étapes.
    rendreRecu();
    rendreEtapes();

    // Sans paramètre, on le dit franchement plutôt que de faire croire à un vrai paiement.
    if (!referenceTransmise) {
      const mention = qs('#mention-maquette');
      if (mention) {
        mention.hidden = false;
        mention.textContent =
          'Aucune réservation n’a été transmise à cette page : les informations affichées sont un exemple de démonstration.';
      }
    }

    // Espèces : le montant se règle sur place, on le rappelle en tête de page.
    if (surPlace) {
      const note = qs('#note-retenue');
      if (note) {
        note.innerHTML =
          '<b>Le montant est réglé sur place, à votre arrivée.</b> Rien n’a été débité : ' +
          esc(f.titre) + ' encaisse directement, en dollars ou en francs congolais. La réservation est tenue sans acompte.';
      }
    }

    initCalendrier();

    if (motion && motion.enregistrer && !motion.reduit()) {
      motion.entree('.confirmation__sceau, .confirmation h1, .confirmation__ref, .recu, .etapes-suivantes li', { y: 14, stagger: 0.05 });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
