# Contrat d’intégration — écrans internes Kongo Explore

Ce document est la référence obligatoire pour toute personne (ou agent) qui
écrit une page de ce projet. La page d’accueil `index.html` est la référence
vivante : sa structure, ses classes et son niveau de finition doivent être
repris, jamais réinventés.

## 1. Front commun à toutes les pages

En-tête, navigation et pied de page sont **identiques** à `index.html` :

- `<a class="skip-link" href="#contenu">Aller au contenu</a>`
- `<header class="site-header">` avec `.wrap.site-header__inner`, le bloc
  `.brand` (logo SVG inline + « Kongo Explore » + `.brand__sub`), le bouton
  `.nav__toggle` (aria-expanded, aria-controls="nav-principal", icône menu) et
  `<nav class="nav" id="nav-principal" data-open="false">` contenant les liens
  `.nav__link` (Adresses, Villes, Comment ça marche, Paiement) puis un
  `<a class="btn btn--gold" href="activites.html">Réserver</a>`.
- Le lien de la page courante porte `aria-current="page"` (posé aussi par
  `core.js`, mais écrire l’attribut est préférable pour le rendu sans JS).
- `<main id="contenu">`, puis `<footer class="site-footer" data-footer></footer>`
  (le pied est injecté par `core.js`).
- Ordre des scripts, en fin de `<body>`, tous en `defer` :
  `gsap`, `ScrollTrigger`, `assets/js/data.js`, `assets/js/core.js`,
  `assets/js/motion.js`, puis le script de la page.
- Feuilles de style dans cet ordre : `tokens.css`, `base.css`,
  `components.css`, `app.css` (plus une feuille propre à la page si besoin).
- Polices : mêmes `<link>` Google Fonts que `index.html` (Besley + Public Sans).
- `<html lang="fr">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  `<title>` descriptif, `<meta name="description">`.

## 2. Vocabulaire de classes autorisé

Ne pas inventer de nouvelle classe quand une existe. Les principales :

| Besoin | Classes |
|---|---|
| Conteneur | `.wrap`, `.wrap--narrow`, `.section`, `.section--tight` |
| Titre de section avec filet | `.head` (`> h2` + `.head__meta`) |
| Fil d’Ariane | `.breadcrumb` (liens + `svg` chevron) |
| Entrée numérotée (liste) | `.entries` > `.entry` avec `.entry__num`, `.entry__thumb` (`.plate`), `.entry__body`, `.entry__title`, `.entry__where`, `.entry__note`, `.entry__side` — rendu par `KEUI.renduEntree(fiche)` |
| Planche photo + légende | `.plate` > `img` (+ `.plate__caption` si légende) |
| Boutons | `.btn`, `.btn--gold`, `.btn--ghost`, `.btn--quiet`, `.btn--block`, `.btn--lg` |
| Étiquettes | `.tag`, `.tag--gold`, `.tag--ink`, `.tag--leaf`, `.tag--brick`, `.tag--ghost` |
| Note, prix | `KEUI.note(v, nb)`, `KEUI.prix(priceObj)`, `.price--sm` |
| Champs | `.field` > `label` + `.input`/`.select`/`.textarea` + `.field__hint` + `.field__error` |
| Cases / radios | `.check` (avec `input` + `.check__label` + `.check__meta`) |
| Filtres segmentés | `.chips` > `.chip` (`aria-pressed`) + `.chip__count` |
| Panneau récapitulatif | `.panel`, `.panel--sticky`, `.panel__title`, `.lines` > `.line` (+ `.line--total`) |
| Étapes de commande | `.stepper` > `.stepper__item[data-etat="fait|courant"]` > `.stepper__puce` |
| Note d’information | `.notice` (icône + texte) |
| État vide | `.empty` |
| Grilles | `.grid--2/3/4`, `.cluster`, `.stack` |
| Texte courant | `.caption` (petites capitales), `.num` (chiffres tabulaires) |

Propres aux écrans internes (définies dans `app.css`) : `.page-head`,
`.villes-grid`/`.ville-card`, `.recherche`, `.filtres`, `.barre-resultats`,
`.fiche-layout`, `.galerie`, `.fiche-corps`, `.forts`, `.pratique`,
`.avis-liste`/`.avis-item`, `.resa-layout`, `.choix`, `.dates`, `.creneaux`/
`.creneau`, `.compteur`, `.moyens`/`.moyen`, `.paiement-panneau`,
`.confirmation`, `.recu`, `.etapes-suivantes`.

## 3. Règles de fond (non négociables)

1. **Tout le contenu vient de `KE`** (`assets/js/data.js`). Aucune donnée
   inventée dans le HTML : les fiches sont rendues en JS à partir de `KE.FICHES`.
2. **Aucune couleur en dur** : uniquement les variables de `tokens.css`.
3. **Aucun émoji**, aucune icône de police : les icônes viennent de
   `KEUI.icone('nom')` ou d’un `<span data-icone="nom"></span>` (jeu maison :
   bed, fork, cup, ticket, compass, shield, phone, check, star, pin, calendar,
   clock, users, wallet, card, info, arrowRight, chevronRight, chevronDown,
   menu, close, spark, leaf, waters, utensils).
4. **Pas de « kicker »/sur-titre au-dessus d’un titre** : pas de petite
   étiquette en capitales précédant un `<h1>`/`<h2>`. Un titre porte son poids.
5. **Pas de cartes identiques empilées** pour structurer une page : préférer
   les filets, les listes réglées, les compositions asymétriques.
6. **Mobile-first** : la mise en page tient à 375 px, puis 768, 1024, 1440.
   Cibles tactiles ≥ 44 px, pas de défilement horizontal.
7. **Accessibilité** : un seul `<h1>` par page, hiérarchie de titres continue,
   `aria-label` sur les groupes de contrôles, `aria-current`/`aria-pressed`
   sur l’état, `aria-live="polite"` sur les zones qui changent en JS,
   focus visible (jamais `outline: none` sans remplacement).
8. **Animations** : utilisent `motion.js` — `KE.motion.reveler(sel, opts)`,
   `KE.motion.volets(sel)`. Jamais plus d’une section épinglée (`pin: true`)
   par page, et aucune sur ces écrans. Rien ne doit dépendre d’une animation
   pour être lisible (`prefers-reduced-motion` rend l’état final).
9. **Navigation réelle** : tous les liens entre pages fonctionnent, avec les
   paramètres d’URL (`activites.html?cat=hotel&commune=Gombe`,
   `fiche.html?id=slug`, `reservation.html?id=slug&mode=...`,
   `paiement.html?id=slug&...`, `confirmation.html?ref=...`).
   Les pages lisent leurs paramètres avec `KEUI.param('id', 'defaut')`.
10. **Code commenté en français**, indenté, sans dépendance externe nouvelle.

## 4. Écrans attendus

- `villes.html` — sélection de ville. Kinshasa ouverte (grande carte, lien
  vers ses adresses), les cinq autres villes en cartes « bientôt » (province,
  note, formulaire d’inscription factice qui confirme en JS).
- `activites.html` — liste filtrable. Filtres : catégorie, commune, prix max
  (curseur), note minimale, disponibilité immédiate. Tri (pertinence, prix
  croissant/décroissant, note). Compteur de résultats, état vide travaillé,
  réinitialisation. Filtres instantanés, aucun rechargement. Paramètres
  d’URL lus au chargement (`cat`, `commune`, `q`).
- `fiche.html` — détail : galerie cliquable, titre, commune, note, prix US$/CDF
  pour l’unité annoncée, résumé, points forts, informations pratiques (table
  `.pratique`), avis clients, panneau collant avec CTA vers `reservation.html`.
- `reservation.html` — formulaire adapté au type : hôtel (dates + chambres +
  voyageurs), restaurant (date + créneaux + nombre de personnes), café
  (date + créneau), événement (date + billets + quantités), expérience
  (séance + participants). Récapitulatif vivant (`dt/dd` + total) et CTA vers
  `paiement.html`.
- `paiement.html` — moyens de paiement (mobile money en premier : M-Pesa,
  Orange Money, Airtel Money, carte ; « espèces sur place » seulement si la
  fiche l’accepte), champs adaptés au moyen choisi (numéro de téléphone,
  carte), frais de service 5 %, récapitulatif, CTA de validation qui mène à
  `confirmation.html?ref=...`. Mention explicite : démonstration, aucun
  paiement réel.
- `confirmation.html` — confirmation : référence de réservation, récapitulatif,
  étapes suivantes, actions (retour aux adresses, ajout au calendrier factice).
- `credits.html` — crédits et provenance des photographies (liste générée
  depuis `assets/img/credits.json`) + note sur le caractère fictif des données.