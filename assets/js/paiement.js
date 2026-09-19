/* ==========================================================================
   Paiement — écran de démonstration, mobile money d’abord
   --------------------------------------------------------------------------
   · lit la réservation transmise par reservation.html (?id=&mode=&debut=&fin=
     &option=&qte=&total=) et retombe sur des valeurs cohérentes si elle
     manque ;
   · affiche les moyens de paiement sans rechargement : mobile money (M-Pesa,
     Orange Money, Airtel Money), carte bancaire, puis espèces sur place
     seulement si la fiche les accepte (pratique.paiement) ;
   · valide les formats côté navigateur et mène à confirmation.html?ref=…
   Aucun paiement n’est réellement traité : rien ne quitte cette page.
   ========================================================================== */

(function () {
  'use strict';

  const { qs, esc, param, icone, fiche, prix, montant } = window.KEUI;

  /* motion.js étend l’objet window.KE ; data.js expose la constante KE.
     On passe donc par window.KE pour le mouvement, et par KE pour les données. */
  const motion = (window.KE && window.KE.motion) || null;

  /* Commission de service de la plateforme, affichée avant la validation. */
  const COMMISSION = 0.05;
  /* Année utilisée dans la référence de réservation (KE-2026-XXXX). */
  const ANNEE = new Date().getFullYear();

  /* ------------------------------------------------------------------------
     1. Petits utilitaires
     ------------------------------------------------------------------------ */

  /** Montant en dollars US, deux décimales au maximum. */
  const dollars = (n) =>
    `${montant(n)} $`;

  /** Montant d’une ligne de récapitulatif : US$ puis équivalent CDF. */
  const montantLigne = (n) =>
    `<span class="num">${dollars(n)}</span> <span class="price__cdf">≈ ${KE.cdf(n)}</span>`;

  /** Date affichable à partir d’une chaîne AAAA-MM-JJ (ou d’une Date). */
  function lireDate(valeur) {
    if (!valeur) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valeur));
    // Midi : évite tout décalage de fuseau sur une date sans heure.
    const d = iso ? new Date(+iso[1], +iso[2] - 1, +iso[3], 12) : new Date(valeur);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Date du jour décalée de n jours, à midi. */
  function dans(n) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  }

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /** « mardi 24 juin 2026 » */
  const dateLongue = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /** Entier positif issu d’un paramètre d’URL, ou repli. */
  function entier(valeur, defaut) {
    const n = parseInt(String(valeur), 10);
    return isFinite(n) && n > 0 ? n : defaut;
  }

  /** Nombre positif issu d’un paramètre d’URL, ou repli. */
  function nombre(valeur, defaut) {
    const n = parseFloat(String(valeur).replace(',', '.'));
    return isFinite(n) && n > 0 ? n : defaut;
  }

  /** Premier paramètre non vide parmi plusieurs noms possibles. */
  const premierParam = (...noms) => {
    for (const nom of noms) {
      const v = param(nom, '');
      if (v) return v;
    }
    return '';
  };

  /* ------------------------------------------------------------------------
     2. Lecture de la réservation
     reservation.html peut nommer ses paramètres de plusieurs façons ; on
     accepte les variantes les plus probables et on replie sur la fiche.
     ------------------------------------------------------------------------ */

  const f = fiche(param('id', '')) || fiche('residence-salongo') || KE.FICHES[0];

  /** Liste de choix de la fiche (chambres, billets, séances ou créneaux). */
  function choixDe(ficheCourante) {
    if (ficheCourante.chambres) return { liste: ficheCourante.chambres, libelle: 'Chambre' };
    if (ficheCourante.billets) return { liste: ficheCourante.billets, libelle: 'Billet' };
    if (ficheCourante.sessions) return { liste: ficheCourante.sessions, libelle: 'Séance' };
    if (ficheCourante.creneaux) return { liste: ficheCourante.creneaux, libelle: 'Créneau' };
    return { liste: [], libelle: 'Formule' };
  }

  /** Quantité : une unité par défaut, deux pour une table ou une sortie. */
  const QUANTITE_DEFAUT = { hotel: 1, restaurant: 2, cafe: 1, evenement: 1, experience: 2 };
  /** Libellé de la ligne de quantité. */
  const LIBELLE_QUANTITE = { hotel: 'Chambres réservées', restaurant: 'Couverts', cafe: 'Places', evenement: 'Billets', experience: 'Participants' };

  const mode = premierParam('mode') || f.categorie;
  const choix = choixDe(f);
  const idOption = premierParam('option', 'chambre', 'billet', 'seance', 'creneau', 'formule');
  const option = choix.liste.find((o) => o.id === idOption) || choix.liste[0] || null;
  const quantite = entier(premierParam('qte', 'quantite', 'personnes', 'voyageurs', 'places', 'couverts'), QUANTITE_DEFAUT[mode] || 1);

  // Dates : un séjour pour un hôtel, une seule date pour les autres formats.
  const debut = lireDate(premierParam('debut', 'arrivee', 'date')) || dans(mode === 'hotel' ? 1 : 2);
  const fin = mode === 'hotel'
    ? lireDate(premierParam('fin', 'depart')) || dans(3)
    : null;
  const nuits = mode === 'hotel' ? Math.max(1, Math.round((fin - debut) / 86400000)) : 1;

  // Prix unitaire : celui du choix retenu, sinon le « à partir de » de la fiche
  // (les créneaux et séances n’ont pas de prix propre).
  const prixUnitaire = option && option.prix ? option.prix.usd : f.aPartirDe.usd;
  const calcule = prixUnitaire * quantite * nuits;
  // Le total transmis par reservation.html fait foi s’il est présent.
  const sousTotal = Math.round(nombre(premierParam('total'), calcule) * 100) / 100;
  const commission = Math.round(sousTotal * COMMISSION * 100) / 100;
  const total = Math.round((sousTotal + commission) * 100) / 100;

  const reservation = { mode, option, quantite, debut, fin, nuits, sousTotal, commission, total };

  /* ------------------------------------------------------------------------
     3. Récapitulatif du panneau collant
     ------------------------------------------------------------------------ */

  /** Ligne de date et d’heure, adaptée au format de réservation. */
  function ligneQuand() {
    if (mode === 'hotel') {
      return `${dateLongue(debut)} → ${dateLongue(fin)} · ${nuits} nuit${nuits > 1 ? 's' : ''}`;
    }
    const creneau = option && option.heures ? ` · ${option.heures}` : f.pratique.horaires ? ` · ${f.pratique.horaires}` : '';
    return dateLongue(debut) + creneau;
  }

  let moyenChoisi = null;

  function rendreRecap() {
    const cible = qs('#recap-lignes');
    if (!cible) return;

    const lignes = [
      `<div class="line"><dt>Établissement</dt><dd>${esc(f.titre)}</dd></div>`,
      `<div class="line"><dt>Commune</dt><dd>${esc(f.commune)}</dd></div>`,
      `<div class="line"><dt>${mode === 'hotel' ? 'Séjour' : 'Date'}</dt><dd>${esc(ligneQuand())}</dd></div>`
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
    lignes.push(`<div class="line"><dt>Moyen de paiement</dt><dd>${moyenChoisi ? esc(moyenChoisi.nom) : '—'}</dd></div>`);

    const totalHtml = prix({ usd: total });
    const libelleTotal = moyenChoisi && moyenChoisi.type === 'cash' ? 'À régler sur place' : 'Total retenu';
    lignes.push(`<div class="line line--total"><dt>${libelleTotal}</dt><dd>${totalHtml}</dd></div>`);

    cible.innerHTML = lignes.join('');

    const commentaire = qs('#recap-commentaire');
    if (commentaire) {
      commentaire.textContent = moyenChoisi && moyenChoisi.type === 'cash'
        ? 'Rien n’est débité maintenant. Le montant ci-dessus est réglé à l’établissement, à votre arrivée.'
        : 'Le montant est retenu par la plateforme et versé à l’établissement après votre arrivée.';
    }

    const texte = qs('#btn-valider-texte');
    if (texte) texte.textContent = moyenChoisi && moyenChoisi.type === 'cash' ? 'Confirmer sans payer' : 'Valider le paiement';
  }

  /* ------------------------------------------------------------------------
     4. Moyens de paiement : mobile money d’abord
     ------------------------------------------------------------------------ */

  /** Vrai si la fiche annonce accepter une famille d’encaissement. */
  function accepte(motif) {
    return (f.pratique.paiement || []).some((p) => p.toLowerCase().indexOf(motif) !== -1);
  }

  const accepteEspeces = accepte('espèce') || accepte('espece');
  const accepteCarte = accepte('carte');

  /** Moyens affichés : les trois comptes mobiles, puis la carte, puis le liquide. */
  function moyensProposes() {
    return KE.PAIEMENTS.filter((p) => {
      if (p.type === 'mobile') return true;
      if (p.type === 'carte') return accepteCarte;
      if (p.type === 'cash') return accepteEspeces;
      return false;
    });
  }

  /** Frais affichés à côté de chaque moyen (aucun frais caché). */
  function fraisDe(p) {
    if (p.type === 'mobile') return 'Aucun frais de transaction · commission de service 5 % comprise dans le total';
    if (p.type === 'carte') return 'Aucun frais de plateforme · commission de service 5 % comprise dans le total';
    return 'Rien à payer maintenant · règlement total à l’arrivée';
  }

  /** Icône maison de la famille de paiement. */
  const iconeDe = (type) => (type === 'mobile' ? 'phone' : type === 'carte' ? 'card' : 'wallet');

  function rendreMoyens(liste, idInitial) {
    const cible = qs('#moyens');
    if (!cible) return;

    cible.innerHTML = liste
      .map(
        (p, i) => `
        <label class="check" data-moyen="${esc(p.id)}">
          <input type="radio" name="moyen" value="${esc(p.id)}"${p.id === idInitial || (!idInitial && i === 0) ? ' checked' : ''}>
          <span class="moyen__icone">${icone(iconeDe(p.type))}</span>
          <span class="moyen__texte">
            <span class="moyen__nom">${esc(p.nom)}</span>
            <span class="moyen__aide">${esc(p.texte)}</span>
            <span class="moyen__frais">${esc(fraisDe(p))}</span>
          </span>
        </label>`
      )
      .join('');
  }

  /** Moyen actuellement coché. */
  function moyenActif() {
    const coché = qs('input[name="moyen"]:checked');
    const liste = moyensProposes();
    return liste.find((p) => coché && p.id === coché.value) || liste[0];
  }

  /* ------------------------------------------------------------------------
     5. Champs propres à chaque moyen
     ------------------------------------------------------------------------ */

  /** Validation d’un numéro congolais : +243 puis 9 chiffres, ou 0 puis 9. */
  function validerTel(valeur, moyen) {
    const propres = String(valeur).replace(/[\s.\-()]/g, '');
    if (!propres) {
      return `Saisissez le numéro rattaché à votre compte ${moyen.nom} : sans lui, la confirmation ne peut pas être envoyée.`;
    }
    const conforme = /^(?:\+?243)(\d{9})$/.exec(propres) || /^0(\d{9})$/.exec(propres);
    if (!conforme) {
      const chiffres = propres.replace(/\D/g, '');
      return `Numéro non reconnu (« ${valeur} », ${chiffres.length} chiffre${chiffres.length > 1 ? 's' : ''}). Attendu : +243 suivi de 9 chiffres (ex. +243 81 234 5678) ou 0 suivi de 9 chiffres.`;
    }
    return '';
  }

  /** Clé de Luhn : contrôle de cohérence d’un numéro de carte. */
  function luhn(chiffres) {
    let somme = 0;
    let doubler = false;
    for (let i = chiffres.length - 1; i >= 0; i--) {
      let n = +chiffres[i];
      if (doubler) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      somme += n;
      doubler = !doubler;
    }
    return somme % 10 === 0;
  }

  function validerCarte(valeur) {
    const chiffres = String(valeur).replace(/[\s-]/g, '');
    if (!chiffres) return 'Saisissez un numéro de carte de démonstration (13 à 19 chiffres).';
    if (!/^\d+$/.test(chiffres)) {
      return 'Le numéro de carte ne doit contenir que des chiffres (les espaces sont acceptés tous les quatre chiffres).';
    }
    if (chiffres.length < 13 || chiffres.length > 19) {
      return `Numéro incomplet : ${chiffres.length} chiffre${chiffres.length > 1 ? 's' : ''} saisi${chiffres.length > 1 ? 's' : ''}, entre 13 et 19 attendus.`;
    }
    if (!luhn(chiffres)) {
      return 'Ce numéro ne passe pas le contrôle de cohérence des cartes. Pour essayer la maquette, 4242 4242 4242 4242 fonctionne.';
    }
    return '';
  }

  function validerExpiration(valeur) {
    const v = String(valeur).trim();
    if (!v) return 'Saisissez la date d’expiration au format MM/AA.';
    const m = /^(\d{1,2})\s*\/?\s*(\d{2})$/.exec(v);
    if (!m) return 'Format attendu MM/AA (ex. 09/28) : le mois, puis les deux derniers chiffres de l’année.';
    const mois = +m[1];
    if (mois < 1 || mois > 12) return `Mois invalide (« ${m[1]} ») : il doit être compris entre 01 et 12 (ex. 09/28).`;
    const maintenant = new Date();
    const finValidite = new Date(2000 + +m[2], mois, 1); // premier jour du mois suivant
    if (finValidite <= new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)) {
      return 'Cette date est déjà passée : indiquez une carte encore valable ce mois-ci.';
    }
    return '';
  }

  function validerCvc(valeur) {
    const v = String(valeur).trim();
    if (!v) return 'Saisissez le cryptogramme à trois chiffres, au dos de la carte.';
    if (!/^\d{3,4}$/.test(v)) return `Cryptogramme invalide (« ${valeur} ») : trois chiffres attendus (quatre pour certaines cartes).`;
    return '';
  }

  function validerNom(valeur) {
    const v = String(valeur).trim();
    if (v.length < 2) return 'Indiquez le nom du titulaire tel qu’il figure sur la carte ou sur la pièce d’identité.';
    if (!/[a-zA-ZÀ-ÿ]/.test(v)) return 'Le nom doit contenir des lettres (ex. Mbuyi Kalala).';
    return '';
  }

  /** Descripteurs de champs, adaptés au moyen retenu. */
  function champsDe(moyen) {
    if (moyen.type === 'mobile') {
      return [
        {
          nom: 'tel',
          label: `Numéro ${moyen.nom}`,
          type: 'tel',
          autocomplete: 'tel',
          placeholder: '+243 81 234 5678',
          hint: `Le numéro rattaché à votre compte ${moyen.nom} : +243 suivi de 9 chiffres. En situation réelle, un SMS de confirmation y serait envoyé.`,
          valider: (v) => validerTel(v, moyen)
        },
        {
          nom: 'titulaire',
          label: 'Nom du titulaire du compte',
          type: 'text',
          autocomplete: 'name',
          placeholder: 'Ex. Mbuyi Kalala',
          hint: 'Le nom enregistré auprès de l’opérateur, pour éviter un rejet au moment de la confirmation.',
          valider: validerNom
        }
      ];
    }

    if (moyen.type === 'carte') {
      return [
        {
          nom: 'carte-numero',
          label: 'Numéro de carte',
          type: 'text',
          autocomplete: 'off',
          placeholder: '4242 4242 4242 4242',
          hint: 'Champ de démonstration : n’indiquez jamais un vrai numéro de carte. Aucune donnée n’est envoyée.',
          valider: validerCarte
        },
        {
          nom: 'carte-expiration',
          label: 'Date d’expiration',
          type: 'text',
          autocomplete: 'off',
          placeholder: '09/28',
          hint: 'Deux chiffres pour le mois, deux pour l’année.',
          valider: validerExpiration,
          rangee: true
        },
        {
          nom: 'carte-cvc',
          label: 'Cryptogramme (CVC)',
          type: 'text',
          autocomplete: 'off',
          placeholder: '123',
          hint: 'Les trois chiffres imprimés au dos de la carte.',
          valider: validerCvc,
          rangee: true
        },
        {
          nom: 'titulaire',
          label: 'Nom inscrit sur la carte',
          type: 'text',
          autocomplete: 'name',
          placeholder: 'Ex. MBUYI KALALA',
          hint: 'Tel qu’il apparaît en relief ou en imprimé sur la carte.',
          valider: validerNom
        }
      ];
    }

    return []; // Espèces : aucun numéro, aucune coordonnée à saisir.
  }

  /** Balisage d’un champ (label visible, aide, zone d’erreur). */
  function champHtml(c) {
    const id = `champ-${c.nom}`;
    return `
      <div class="field">
        <label for="${id}">${esc(c.label)}</label>
        <input class="input" id="${id}" name="${esc(c.nom)}" type="${esc(c.type)}" value=""
               placeholder="${esc(c.placeholder || '')}" autocomplete="${esc(c.autocomplete || 'off')}"
               spellcheck="false" aria-describedby="${id}-aide" aria-invalid="false">
        <p class="field__hint" id="${id}-aide">${esc(c.hint || '')}</p>
        <p class="field__error" id="${id}-erreur" hidden></p>
      </div>`;
  }

  /** Panneau sous les moyens : les champs du moyen choisi, ou l’explication liquide. */
  function rendrePanneau(moyen) {
    const cible = qs('#panneau-moyen');
    if (!cible) return;

    if (moyen.type === 'cash') {
      cible.innerHTML = `
        <div class="notice" role="note">
          ${icone('wallet')}
          <span>
            <b>Espèces sur place.</b> ${esc(f.titre)} accepte le règlement à l’arrivée
            (${esc((f.pratique.paiement || []).join(', '))}). Aucun montant n’est débité maintenant :
            la réservation est simplement enregistrée, et vous réglez ${dollars(total)} sur place,
            en dollars ou en francs congolais.
          </span>
        </div>
        <dl class="lines">
          <div class="line"><dt>À régler à l’arrivée</dt><dd>${prix({ usd: total })}</dd></div>
          <div class="line"><dt>Référence présentée à l’accueil</dt><dd>Générée à la validation</dd></div>
          <div class="line"><dt>Réservation maintenue sans acompte</dt><dd>Démonstration</dd></div>
        </dl>
        <p class="field__error" id="resume-erreurs" role="alert" hidden></p>`;
      return;
    }

    // Regroupe les champs marqués « rangee » deux par deux sur une même ligne.
    let html = '';
    let rangee = [];
    const viderRangee = () => {
      if (rangee.length) {
        html += `<div class="dates">${rangee.map(champHtml).join('')}</div>`;
        rangee = [];
      }
    };
    champsDe(moyen).forEach((c) => {
      if (c.rangee) rangee.push(c);
      else {
        viderRangee();
        html += champHtml(c);
      }
    });
    viderRangee();

    const rappel = moyen.type === 'mobile'
      ? `Le paiement serait confirmé par ${esc(moyen.nom)} : ${esc(moyen.texte.toLowerCase())}`
      : 'Le paiement serait confirmé par votre banque, en dollars US.';

    cible.innerHTML = `
      <div class="notice" role="note">
        ${icone('info')}
        <span>${rappel} <b>Dans cette maquette, rien n’est transmis : les champs ne sont pas enregistrés.</b></span>
      </div>
      ${html}
      <p class="field__error" id="resume-erreurs" role="alert" hidden></p>`;
  }

  /* ------------------------------------------------------------------------
     6. Validation et envoi
     ------------------------------------------------------------------------ */

  /** Affiche ou efface le message d’erreur d’un champ. */
  function marquerErreur(nom, message) {
    const champ = qs(`#champ-${nom}`);
    const zone = qs(`#champ-${nom}-erreur`);
    if (!champ || !zone) return;
    champ.setAttribute('aria-invalid', message ? 'true' : 'false');
    zone.textContent = message || '';
    zone.hidden = !message;
  }

  /** Valide tous les champs du moyen retenu ; retourne le premier champ fautif. */
  function validerFormulaire(moyen) {
    const champs = champsDe(moyen);
    let premierFautif = null;
    let resume = '';

    champs.forEach((c) => {
      const champ = qs(`#champ-${c.nom}`);
      const message = champ ? c.valider(champ.value) : '';
      marquerErreur(c.nom, message);
      if (message) {
        if (!premierFautif) {
          premierFautif = champ;
          resume = message;
        }
      }
    });

    const zoneResume = qs('#resume-erreurs');
    if (zoneResume) {
      zoneResume.textContent = premierFautif
        ? `Le formulaire n’est pas complet : ${resume}`
        : '';
      zoneResume.hidden = !premierFautif;
    }

    return premierFautif;
  }

  /** Référence de réservation, au format KE-2026-XXXX. */
  function reference() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1
    const octets = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(octets);
    else for (let i = 0; i < 4; i++) octets[i] = Math.floor(Math.random() * 256);
    let suffixe = '';
    for (let i = 0; i < 4; i++) suffixe += alphabet[octets[i] % alphabet.length];
    return `KE-${ANNEE}-${suffixe}`;
  }

  /** Adresse de confirmation : la réservation et le moyen retenu, jamais le numéro. */
  function urlConfirmation() {
    const p = new URLSearchParams();
    p.set('ref', reference());
    p.set('id', f.id);
    p.set('mode', mode);
    p.set('debut', iso(debut));
    if (fin) p.set('fin', iso(fin));
    if (option) p.set('option', option.id);
    p.set('qte', String(quantite));
    p.set('total', String(sousTotal));
    p.set('moyen', moyenChoisi ? moyenChoisi.id : 'mpesa');
    return `confirmation.html?${p.toString()}`;
  }

  function envoyer(evenement) {
    evenement.preventDefault();
    const moyen = moyenActif();
    const fautif = validerFormulaire(moyen);
    if (fautif) {
      fautif.focus();
      return;
    }

    // État de chargement bref, puis passage à la confirmation.
    const bouton = qs('#btn-valider');
    const texte = qs('#btn-valider-texte');
    if (bouton) {
      bouton.disabled = true;
      bouton.setAttribute('aria-busy', 'true');
    }
    if (texte) texte.textContent = 'Vérification en cours…';

    window.setTimeout(() => {
      window.location.href = urlConfirmation();
    }, 650);
  }

  /* ------------------------------------------------------------------------
     7. Démarrage
     ------------------------------------------------------------------------ */

  function init() {
    const liste = moyensProposes();

    // reservation.html peut annoncer le moyen souhaité (?moyen=carte) : on
    // présélectionne ce moyen s’il est bien proposé par la fiche.
    const moyenDemande = premierParam('moyen', 'paiement');
    const idInitial = liste.some((p) => p.id === moyenDemande) ? moyenDemande : '';

    rendreMoyens(liste, idInitial);
    moyenChoisi = moyenActif();
    rendrePanneau(moyenChoisi);
    rendreRecap();

    // Changement de moyen : les champs se remplacent sans rechargement.
    const moyens = qs('#moyens');
    if (moyens) {
      moyens.addEventListener('change', () => {
        moyenChoisi = moyenActif();
        rendrePanneau(moyenChoisi);
        rendreRecap();
      });
    }

    const formulaire = qs('#form-paiement');
    if (formulaire) formulaire.addEventListener('submit', envoyer);

    // Fil d’Ariane : on garde les paramètres de la réservation en cours.
    const lienFiche = qs('#fil-fiche');
    if (lienFiche) lienFiche.href = `fiche.html?id=${encodeURIComponent(f.id)}`;
    const lienResa = qs('#fil-reservation');
    if (lienResa) lienResa.href = `reservation.html${window.location.search}`;

    // Entrée douce de la page, si le mouvement est autorisé.
    if (motion && motion.enregistrer && !motion.reduit()) {
      motion.entree('.page-head, .stepper, .notice, .resa-layout > *', { y: 14, stagger: 0.06 });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
