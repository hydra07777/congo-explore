# Kongo Explore — Système de design

Document décrivant le monde visuel tel qu'il est **construit** dans
`assets/css/`. Toute modification d'interface part d'ici. Les valeurs vivent
dans `assets/css/tokens.css` ; ce document les nomme et explique les décisions.

## 1. Le monde

Le guide de ville imprimé, celui qu'on achète au coin de l'avenue du Commerce :
entrées numérotées, filets de 1 px, légendes en petites capitales, prix en
dollars avec l'équivalent en francs congolais sur la même ligne, photographies
posées en pleine largeur sur du papier chaud.

Ce que ce monde refuse explicitement :

- la pastille de recherche flottante au-dessus d'un ciel générique ;
- trois cartes identiques à icône + titre + texte comme structure de page ;
- la grille de logos et le pied de page à quatre colonnes interchangeable ;
- le « kicker » en capitales au-dessus d'un titre.

À la place : un index numéroté, une fiche de recherche imprimée, des tableaux
réglés, et un seul moment signé par page.

## 2. Couleur

Stratégie : **neutres + un accent unique**. Le papier et l'encre portent la
page ; le jaune du drapeau ne sert qu'à ce qui agit ou compte.

| Rôle | Variable | Valeur (clair) | Usage |
|---|---|---|---|
| Papier | `--paper` | `#F7F3EC` | fond de page |
| Fiche | `--paper-2` | `#FFFDF9` | panneaux, champs, cartes |
| Bande | `--paper-3` | `#EFE9DF` | alternance, socle d'image |
| Encre | `--ink` | `#14120F` | texte principal, filets forts |
| Encre douce | `--ink-soft` | `#4A453E` | texte secondaire |
| Encre muette | `--ink-mute` | `#6F6862` | légendes, méta (≥ 4,5:1 sur papier) |
| Filet | `--rule` | encre à 12 % | séparateurs, bordures de cartes |
| Accent | `--gold` | `#F2C200` | CTA, surlignage, tampon, état actif |
| Accent appuyé | `--gold-deep` | `#D9AD00` | survol, bordure d'accent |
| Aplat d'accent | `--gold-wash` | `#FDF3CF` | survol de ligne, case cochée |
| Bleu | `--sky` | `#2F6FA8` | focus, information |
| Brique | `--brick` | `#A83A2B` | alerte, dernière place |
| Vert | `--leaf` | `#2F6B4F` | disponibilité, confirmation |

Le texte sur accent est toujours `--on-accent` (encre), jamais du blanc : le
jaune est clair, il porte de l'encre.

**Mode sombre** : la scène d'usage est diurne, mais la préférence système est
respectée. Les rôles sont réécrits dans `tokens.css` sous
`@media (prefers-color-scheme: dark)` — jamais de couleur en dur ailleurs.

## 3. Typographie

| | Police | Rôle |
|---|---|---|
| Titres | **Besley** (slab serif, variable 400–800) | titres, noms d'adresses, chiffres de prix |
| Texte | **Public Sans** (sans humaniste, variable) | interface, paragraphes, contrôles |

Pourquoi ces deux-là : un guide imprimé porte un slab serif d'affiche pour ses
entrées et une sans humaniste lisible pour son corps de texte — et aucun des
deux n'est le choix réflexe de la catégorie.

Échelle fluide (`clamp`) de `--step--1` (0,81–0,88 rem) à `--step-6`
(2,75–6 rem). Titres : interlettrage −0,02 à −0,035 em, `text-wrap: balance`.
Corps : `text-wrap: pretty`, mesure max 68 caractères. Les légendes sont en
petites capitales (`--tracking-caps` 0,14 em), jamais au-dessus d'un titre —
uniquement comme étiquette de donnée (commune, unité, état).

## 4. Espacement et rythme

Échelle unique de `--s-1` (0,25 rem) à `--s-9` (6 rem), plus
`--section-y` (4–8 rem) entre sections. Règle : plus d'air au-dessus d'un
titre qu'en dessous. Conteneur `--maxw` 78 rem, gouttière fluide.

## 5. Formes et profondeur

Rayons : 2 px (étiquette), 4 px (bouton, champ, planche photo), 8 px (panneau),
14 px (carte d'écran interne), pilule (pastille, compteur).

Trois ombres seulement, toujours avec décalage **et** flou :
`--shadow-1` (filet relevé), `--shadow-2` (fiche posée sur la photo),
`--shadow-3` (planche du héros). Aucune ombre dure à décalage sans flou.

Le filet de 1 px fait le travail que les cartes font d'habitude : entrées,
tableaux pratiques, listes de villes, réassurance. Pas de bordure colorée à
gauche, pas de carte imbriquée.

## 6. Mouvement

Un seul moment signé par page, orchestré dans `motion.js` et le script de page.

| Moment | Où | Technique |
|---|---|---|
| Entrée du héros | accueil | volet `clip-path` sur la photo, titre levé derrière masque, tampon posé en `back.out` |
| Parallaxe | accueil | `yPercent` ±3 sur la photo du héros, `scrub: 0.5` |
| Index numéroté | accueil | volet d'image au défilement, décalage 50 ms entre entrées |
| Parcours épinglé | accueil | `pin` + `scrub`, rail jaune qui se remplit, étapes allumées |
| Révélations | toutes | `ScrollTrigger.batch`, une seule fois, 6 éléments par lot |

Règles : seuls `transform`, `opacity`, `clip-path` et `filter` sont animés ;
durées 0,35–1,5 s ; courbe `expo.out` par défaut ; jamais plus d'une section
épinglée par page ; **aucun contenu n'est masqué par le CSS en attendant une
animation** — l'état initial est posé en JS, uniquement pour ce qui est hors
écran, et `prefers-reduced-motion` laisse tout lisible immédiatement.

## 7. Composants

- **En-tête** : barre collante, `backdrop-filter` léger, filet qui se renforce
  au défilement (`data-stuck`), menu déroulant sous 62 rem, 44 px de cible.
- **Boutons** : 44 px minimum, `scale(0.97)` à l'appui, trois variantes
  (encre pleine, accent, contour) plus une variante « quiet » soulignée.
- **Fiche de recherche** : grille 3 champs + action, filets internes, bordures
  franches — un formulaire imprimé, pas une pastille flottante.
- **Entrée numérotée** (`.entry`) : numéro, planche photo 4/3, titre, commune,
  note, prix + unité, lien. Sur mobile, la photo passe au-dessus.
- **Planche photo** (`.plate`) : image `object-fit: cover` + légende imprimée.
- **Tampon** (`.stamp`) : étiquette encadrée, inclinée à −1,4°.
- **Panneau récapitulatif** (`.panel--sticky`) : liste de définitions, total en
  grand, reste collé sous l'en-tête sur les écrans de commande.
- **Icônes** : jeu maison de 26 pictogrammes, trait 1,6, bouts ronds, dessinés
  dans `core.js`. Aucun émoji, aucune icône de police.
- **Chrome du navigateur** : sélection jaune encre, curseur d'écriture en encre,
  barre de défilement dessinée, anneau de focus bleu ciel à 2 px décalé.

## 8. États

Chaque contrôle a : repos, survol (`@media (hover: hover)` uniquement),
focus visible, appui, désactivé (`aria-disabled` / `disabled`), chargement
(bouton de paiement), erreur (`.field__error` nommant le problème et la
sortie), vide (`.empty` avec action de reprise). Les contrôles nomment leur
action ; les erreurs nomment le problème et la récupération.

## 9. Responsive

Mobile d'abord. Quatre largeurs de référence : **375, 768, 1024, 1440**.
Points de rupture : 48 rem (empilement complet), 64 rem (deux colonnes,
en-tête replié au-delà de 62 rem). Aucune largeur fixe en pixels sur les
conteneurs, aucune barre de défilement horizontale, cibles tactiles ≥ 44 px.

## 10. Accessibilité

Contraste : corps ≥ 4,5:1, grands titres ≥ 3:1, texte sur accent en encre.
Structure : un seul `h1` par page, hiérarchie continue, `main` unique, lien
d'évitement, fil d'Ariane sur les écrans internes, `aria-label` sur les
groupes de contrôles, `aria-pressed` / `aria-current` / `aria-expanded` sur
les états, `aria-live="polite"` sur les zones recalculées (résultats, total).
Le focus n'est jamais supprimé sans remplacement visible.

## 11. Provenance des visuels

Photographies réelles de Wikimedia Commons, recadrées et compressées
localement (`tools/build_images.py`), auteur et licence par fichier dans
`assets/img/credits.json` et sur `credits.html`. Les établissements, prix et
avis sont des données fictives ; cette limite est affichée dans le pied de
page, sur la page de crédits et dans le parcours de paiement.
