/* ==========================================================================
   Données mockées — Kongo Explore
   --------------------------------------------------------------------------
   Aucun backend : tout ce que l'interface affiche vient d'ici.
   Les lieux sont INVENTÉS mais plausibles pour Kinshasa ; les noms de
   communes, quartiers et repères géographiques sont réels. Les prix sont
   exprimés en USD avec l'équivalent CDF au taux de référence ci-dessous.
   Toute donnée est synthétique — voir la mention « maquette » du pied de page.
   ========================================================================== */

/* Le module expose son contenu sur l’objet global : les autres scripts
   (core, motion, pages) l’attachent au même objet, ce qui évite deux
   « KE » concurrents — un global lexical et une propriété de window. */
window.KE = (() => {
  'use strict';

  /** Taux de référence utilisé pour toutes les conversions affichées. */
  const TAUX_USD_CDF = 2900;

  /* Formatage français posé à la main : un ICU réduit (certains navigateurs
     mobiles) afficherait « 4.7 » au lieu de « 4,7 ». */
  const sep = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /** Formate un montant en dollars US. */
  const usd = (n) => `${Number.isInteger(n) ? sep(n) : sep(n).replace('.', ',')} $`;

  /** Équivalent en francs congolais, arrondi à la centaine. */
  const cdf = (n) => {
    const v = Math.round((n * TAUX_USD_CDF) / 100) * 100;
    return `${sep(v)} CDF`;
  };

  /** Ajoute l'équivalent CDF à chaque prix d'un objet de données. */
  const priceOf = (n) => ({ usd: n, cdf: n * TAUX_USD_CDF });

  /* ------------------------------------------------------------------------
     Villes
     ------------------------------------------------------------------------ */
  const VILLES = [
    {
      id: 'kinshasa',
      nom: 'Kinshasa',
      statut: 'disponible',
      province: 'Kinshasa',
      habitants: '17,8 M',
      accroche: 'Douze adresses vérifiées, du fleuve à la Gombe.',
      quartiers: ['Gombe', 'Ngaliema', 'Limete', 'Kalamu', 'Bandalungwa', 'Kintambo', 'Lemba', 'Barumbu', 'Masina', 'Maluku'],
      image: 'assets/img/ville-kinshasa.jpg',
      legende: 'Le fleuve Congo depuis le quai de Kinshasa',
    },
    { id: 'lubumbashi', nom: 'Lubumbashi', statut: 'bientot', province: 'Haut-Katanga', note: 'Ouverture prévue au 2e trimestre' },
    { id: 'goma', nom: 'Goma', statut: 'bientot', province: 'Nord-Kivu', note: 'Adresses en cours de vérification' },
    { id: 'bukavu', nom: 'Bukavu', statut: 'bientot', province: 'Sud-Kivu', note: 'Partenaires signés, fiches en cours' },
    { id: 'matadi', nom: 'Matadi', statut: 'bientot', province: 'Kongo-Central', note: 'Étude de marché en cours' },
    { id: 'kolwezi', nom: 'Kolwezi', statut: 'bientot', province: 'Lualaba', note: 'Étude de marché en cours' }
  ];

  /* ------------------------------------------------------------------------
     Catégories
     ------------------------------------------------------------------------ */
  const CATEGORIES = [
    { id: 'hotel', nom: 'Hôtels', court: 'Hôtels', icone: 'bed', texte: 'Nuitées, chambres et petites résidences, avec le petit-déjeuner annoncé sans surprise.' },
    { id: 'restaurant', nom: 'Restaurants', court: 'Restos', icone: 'fork', texte: 'Du maquis de quartier à la table de la Gombe, avec la table réservée à l’avance.' },
    { id: 'cafe', nom: 'Cafés', court: 'Cafés', icone: 'cup', texte: 'Cafés de spécialité, terrasses et coins de travail, où l’on s’assoit sans réserver une salle entière.' },
    { id: 'evenement', nom: 'Événements', court: 'Événements', icone: 'ticket', texte: 'Concerts, festivals et soirées : billets numérotés, entrée garantie.' },
    { id: 'experience', nom: 'Expériences', court: 'Expériences', icone: 'compass', texte: 'Fleuve, danse, sape, marché central : des sorties menées par des gens d’ici.' }
  ];

  /* ------------------------------------------------------------------------
     Fiches (12 entrées pour Kinshasa)
     ------------------------------------------------------------------------ */
  const FICHES = [
    {
      id: 'residence-salongo',
      numero: 1,
      titre: 'Résidence Salongo',
      categorie: 'hotel',
      commune: 'Gombe',
      quartier: 'Avenue Colonel Ebeya',
      resume: 'Onze chambres dans un immeuble des années 60, à trois minutes du Boulevard du 30 Juin. Groupe électrogène et eau chaude annoncés en continu.',
      note: 4.7,
      avis: 128,
      aPartirDe: priceOf(98),
      unite: 'la nuit',
      image: 'assets/img/fiche-salongo.jpg',
      galerie: ['assets/img/fiche-salongo.jpg', 'assets/img/galerie-chambre.jpg', 'assets/img/galerie-reception.jpg'],
      legende: 'Façade sur l’avenue Colonel Ebeya, Gombe',
      fort: ['Groupe électrogène 24/7', 'Petit-déjeuner inclus', 'Parking clos', 'Navette aéroport'],
      pratique: {
        adresse: '14, avenue Colonel Ebeya, Gombe',
        horaires: 'Réception ouverte 24 h/24',
        capacite: '11 chambres',
        langues: 'Français, lingala, anglais',
        paiement: ['Mobile money', 'Carte bancaire', 'Espèces USD'],
        distance: '3 min à pied du Boulevard du 30 Juin'
      },
      chambres: [
        { id: 'std', nom: 'Chambre standard', details: '1 lit double · 18 m² · ventilateur + clim', prix: priceOf(98), restant: 4 },
        { id: 'sup', nom: 'Chambre supérieure', details: '1 lit queen · 24 m² · balcon sur l’avenue', prix: priceOf(132), restant: 2 },
        { id: 'suite', nom: 'Suite Salongo', details: 'Chambre + salon · 38 m² · coin bureau', prix: priceOf(186), restant: 1 }
      ],
      avisList: [
        { auteur: 'Mbuyi Kalala', date: '12 juin', note: 5, texte: 'Chambre impeccable et le groupe n’a pas bronché pendant la coupure de courant. Réception très disponible.' },
        { auteur: 'Sarah Ngalula', date: '3 mai', note: 4, texte: 'Très bien situé pour la Gombe. Le petit-déjeuner est simple mais servi tôt, ce qui compte avant une réunion.' },
        { auteur: 'Fiston Muteba', date: '28 avril', note: 5, texte: 'Réservation faite depuis mon téléphone, payée avec Airtel Money. Aucun souci à l’arrivée.' }
      ]
    },
    {
      id: 'kalonji-riviera',
      numero: 2,
      titre: 'Hôtel Kalonji Riviera',
      categorie: 'hotel',
      commune: 'Ngaliema',
      quartier: 'Boulevard de la Libération',
      resume: 'Piscine, jardin sur la falaise et vue sur le fleuve. Le cadre des week-ends en famille et des séminaires d’une journée.',
      note: 4.5,
      avis: 214,
      aPartirDe: priceOf(142),
      unite: 'la nuit',
      image: 'assets/img/fiche-kalonji.jpg',
      galerie: ['assets/img/fiche-kalonji.jpg', 'assets/img/galerie-jardin.jpg', 'assets/img/galerie-chambre.jpg'],
      legende: 'Le jardin et la piscine, côté falaise',
      fort: ['Piscine', 'Salle de séminaire', 'Jardin privé', 'Wi-Fi fibre'],
      pratique: {
        adresse: '112, boulevard de la Libération, Ngaliema',
        horaires: 'Réception 24 h/24 · piscine 6 h – 20 h',
        capacite: '48 chambres · 2 salles',
        langues: 'Français, lingala, anglais',
        paiement: ['Mobile money', 'Carte bancaire', 'Virement'],
        distance: '10 min en voiture du centre des affaires'
      },
      chambres: [
        { id: 'jardin', nom: 'Chambre côté jardin', details: '1 lit double · 22 m²', prix: priceOf(142), restant: 6 },
        { id: 'fleuve', nom: 'Chambre vue fleuve', details: '1 lit king · 28 m² · balcon', prix: priceOf(198), restant: 3 },
        { id: 'familiale', nom: 'Chambre familiale', details: '2 lits doubles · 40 m²', prix: priceOf(235), restant: 2 }
      ],
      avisList: [
        { auteur: 'Ndaya Tshala', date: '19 juin', note: 5, texte: 'La vue sur le fleuve au petit matin vaut le déplacement. Personnel aux petits soins avec les enfants.' },
        { auteur: 'Papy Lukusa', date: '7 juin', note: 4, texte: 'Séminaire d’une journée impeccable, salle climatisée et pause-café bien fournie.' },
        { auteur: 'Grâce Mujinga', date: '1 juin', note: 4, texte: 'Un peu cher le week-end, mais la piscine est entretenue et le jardin très agréable.' }
      ]
    },
    {
      id: 'auberge-du-fleuve',
      numero: 3,
      titre: 'Auberge du Fleuve',
      categorie: 'hotel',
      commune: 'Limete',
      quartier: 'Quai de la Foire',
      resume: 'Petite auberge en bord de fleuve, bon rapport qualité-prix, à dix minutes du marché central. Idéale pour une escale courte.',
      note: 4.2,
      avis: 76,
      aPartirDe: priceOf(54),
      unite: 'la nuit',
      image: 'assets/img/fiche-auberge.jpg',
      galerie: ['assets/img/fiche-auberge.jpg', 'assets/img/galerie-chambre.jpg'],
      legende: 'La cour intérieure, côté quai',
      fort: ['Bord de fleuve', 'Petit budget', 'Bagagerie', 'Cuisine partagée'],
      pratique: {
        adresse: '7, avenue de la Foire, Limete',
        horaires: 'Accueil 6 h – 23 h',
        capacite: '9 chambres',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Espèces CDF'],
        distance: '10 min en taxi du marché central'
      },
      chambres: [
        { id: 'simple', nom: 'Chambre simple', details: '1 lit simple · 12 m² · ventilateur', prix: priceOf(54), restant: 3 },
        { id: 'double', nom: 'Chambre double', details: '1 lit double · 16 m² · clim', prix: priceOf(76), restant: 2 }
      ],
      avisList: [
        { auteur: 'Nzuzi Bofunga', date: '22 juin', note: 4, texte: 'Simple et propre. Le quai permet de marcher le soir, ce qui est rare à ce prix.' },
        { auteur: 'Élombe Kanku', date: '2 juin', note: 4, texte: 'Accueil familial, on m’a gardé le bagage après le départ sans rien demander.' },
        { auteur: 'Alice Mbala', date: '14 mai', note: 5, texte: 'Parfait pour deux nuits. Le ventilateur suffit, la clim dans la double est un vrai plus.' }
      ]
    },
    {
      id: 'maquis-maman-nzuzi',
      numero: 4,
      titre: 'Maquis Chez Maman Nzuzi',
      categorie: 'restaurant',
      commune: 'Kalamu',
      quartier: 'Matonge, avenue Kasa-Vubu',
      resume: 'Le maquis de référence à Matonge : poulet à la moambe, poisson salé, fufu et chikwangue sortis du feu. On réserve sa table, surtout le vendredi.',
      note: 4.8,
      avis: 341,
      aPartirDe: priceOf(16),
      unite: 'pour deux',
      image: 'assets/img/fiche-nzuzi.jpg',
      galerie: ['assets/img/fiche-nzuzi.jpg', 'assets/img/galerie-table.jpg', 'assets/img/galerie-marche.jpg'],
      legende: 'Service du soir, terrasse sur l’avenue',
      fort: ['Cuisine congolaise', 'Terrasse', 'Plats à emporter', 'Groupes bienvenus'],
      pratique: {
        adresse: '58, avenue Kasa-Vubu, Matonge',
        horaires: 'Mardi – dimanche · 11 h – 23 h',
        capacite: '14 tables · 2 salles',
        langues: 'Français, lingala, swahili',
        paiement: ['Mobile money', 'Espèces CDF', 'Espèces USD'],
        distance: 'À 200 m de l’arrêt Kasa-Vubu'
      },
      services: ['Déjeuner', 'Dîner', 'À emporter'],
      creneaux: [
        { id: 'dej-1230', nom: 'Déjeuner', heures: '12 h 30 – 14 h 30', places: 6 },
        { id: 'din-1900', nom: 'Dîner', heures: '19 h 00 – 21 h 00', places: 2 },
        { id: 'din-2100', nom: 'Dîner tardif', heures: '21 h 00 – 23 h 00', places: 8 }
      ],
      avisList: [
        { auteur: 'Kabeya Nsimba', date: '24 juin', note: 5, texte: 'La moambe est exactement celle de la maison. On a réservé à 19 h, table prête à la minute.' },
        { auteur: 'Divine Mwamba', date: '17 juin', note: 5, texte: 'Ambiance du quartier, portions généreuses. Attention, le vendredi ça se remplit vite.' },
        { auteur: 'Serge Ilunga', date: '9 juin', note: 4, texte: 'Excellent poisson salé. Le service peut être long en pleine pointe, mais on est prévenu.' }
      ]
    },
    {
      id: 'grill-de-la-gombe',
      numero: 5,
      titre: 'Le Grill de la Gombe',
      categorie: 'restaurant',
      commune: 'Gombe',
      quartier: 'Avenue des Aviateurs',
      resume: 'Grillades au feu de bois, carte courte et cave correcte. La table des déjeuners d’affaires, avec un service tenu.',
      note: 4.6,
      avis: 189,
      aPartirDe: priceOf(38),
      unite: 'pour deux',
      image: 'assets/img/fiche-grill.jpg',
      galerie: ['assets/img/fiche-grill.jpg', 'assets/img/galerie-table.jpg'],
      legende: 'Le comptoir de grillades en salle',
      fort: ['Grillades au feu de bois', 'Climatisé', 'Carte de vins', 'Parking'],
      pratique: {
        adresse: '31, avenue des Aviateurs, Gombe',
        horaires: 'Lundi – samedi · 12 h – 15 h et 18 h 30 – 23 h',
        capacite: '18 tables',
        langues: 'Français, anglais',
        paiement: ['Carte bancaire', 'Mobile money'],
        distance: 'Face aux banques du centre'
      },
      services: ['Déjeuner', 'Dîner'],
      creneaux: [
        { id: 'dej-1300', nom: 'Déjeuner', heures: '13 h 00 – 14 h 30', places: 5 },
        { id: 'din-2000', nom: 'Dîner', heures: '20 h 00 – 22 h 00', places: 4 }
      ],
      avisList: [
        { auteur: 'Christian Mavungu', date: '20 juin', note: 5, texte: 'Le filet de capitaine grillé est parfaitement cuit. Service rapide, on tient une heure de pause déjeuner.' },
        { auteur: 'Léonie Tshibangu', date: '11 juin', note: 4, texte: 'Cadre très soigné et climatisé, ce qui aide en saison des pluies.' },
        { auteur: 'Blaise Ngoy', date: '30 mai', note: 4, texte: 'Un peu cher pour la ville, mais la constance est là et la réservation évite l’attente.' }
      ]
    },
    {
      id: 'table-de-bandal',
      numero: 6,
      titre: 'La Table de Bandal',
      categorie: 'restaurant',
      commune: 'Bandalungwa',
      quartier: 'Avenue Kikwit',
      resume: 'Cuisine de quartier revisitée : pondu, madesu, poulet braisé, servis dans une cour plantée. Le rendez-vous des familles du dimanche.',
      note: 4.4,
      avis: 132,
      aPartirDe: priceOf(22),
      unite: 'pour deux',
      image: 'assets/img/fiche-bandal.jpg',
      galerie: ['assets/img/fiche-bandal.jpg', 'assets/img/galerie-table.jpg'],
      legende: 'La cour plantée, service du dimanche',
      fort: ['Menu du dimanche', 'Cour ombragée', 'Menus enfants', 'Groupes'],
      pratique: {
        adresse: '26, avenue Kikwit, Bandalungwa',
        horaires: 'Mercredi – dimanche · 11 h 30 – 22 h',
        capacite: '20 tables',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Espèces CDF'],
        distance: '5 min en taxi du rond-point Bandal'
      },
      services: ['Déjeuner', 'Dîner', 'À emporter'],
      creneaux: [
        { id: 'dej-1200', nom: 'Déjeuner', heures: '12 h 00 – 14 h 00', places: 9 },
        { id: 'din-1900', nom: 'Dîner', heures: '19 h 00 – 21 h 30', places: 5 }
      ],
      avisList: [
        { auteur: 'Mujinga Kasa', date: '23 juin', note: 5, texte: 'Le pondu du dimanche est généreux, et la cour permet aux enfants de bouger.' },
        { auteur: 'Jean-Marc Tshite', date: '15 juin', note: 4, texte: 'Bon rapport qualité-prix, service souriant. Un peu d’attente à l’entrée à midi.' },
        { auteur: 'Nadine Kapinga', date: '6 juin', note: 4, texte: 'Idéal pour un repas de famille sans se ruiner.' }
      ]
    },
    {
      id: 'kawa-kin',
      numero: 7,
      titre: 'Kawa Kin',
      categorie: 'cafe',
      commune: 'Kintambo',
      quartier: 'Avenue Bongolo',
      resume: 'Torréfaction sur place, grains du Nord-Kivu, comptoir en bois et prises à chaque place. Le meilleur café filtre de la rive droite.',
      note: 4.9,
      avis: 204,
      aPartirDe: priceOf(6),
      unite: 'la place',
      image: 'assets/img/fiche-kawa.jpg',
      galerie: ['assets/img/fiche-kawa.jpg', 'assets/img/galerie-cafe.jpg'],
      legende: 'Le comptoir de torréfaction, en début de journée',
      fort: ['Café de spécialité', 'Wi-Fi', 'Travail tranquille', 'Vente de grains'],
      pratique: {
        adresse: '9, avenue Bongolo, Kintambo',
        horaires: 'Lundi – samedi · 7 h – 19 h',
        capacite: '24 places',
        langues: 'Français, lingala, anglais',
        paiement: ['Mobile money', 'Carte bancaire'],
        distance: 'À 300 m du marché de Kintambo'
      },
      creneaux: [
        { id: 'matin', nom: 'Matin', heures: '8 h 00 – 11 h 00', places: 12 },
        { id: 'apresmidi', nom: 'Après-midi', heures: '14 h 00 – 17 h 00', places: 9 },
        { id: 'soir', nom: 'Soirée', heures: '17 h 00 – 19 h 00', places: 6 }
      ],
      avisList: [
        { auteur: 'Yannick Lumbala', date: '25 juin', note: 5, texte: 'Le café filtre du Kivu est excellent et le Wi-Fi tient. J’y travaille deux matinées par semaine.' },
        { auteur: 'Amina Bashige', date: '13 juin', note: 5, texte: 'Accueil chaleureux, on explique les origines des grains sans faire la leçon.' },
        { auteur: 'Rodrigue Kambala', date: '4 juin', note: 5, texte: 'Prises partout, tables assez larges pour un ordinateur. Rare et précieux.' }
      ]
    },
    {
      id: 'cafe-biso',
      numero: 8,
      titre: 'Café Biso',
      categorie: 'cafe',
      commune: 'Lemba',
      quartier: 'Avenue de la Science',
      resume: 'Café de quartier étudiant, prix tenus, tartines et jus de bissap maison. On s’assoit sur la terrasse couverte.',
      note: 4.3,
      avis: 88,
      aPartirDe: priceOf(4),
      unite: 'la place',
      image: 'assets/img/fiche-biso.jpg',
      galerie: ['assets/img/fiche-biso.jpg'],
      legende: 'Terrasse couverte, côté université',
      fort: ['Prix étudiants', 'Jus maison', 'Terrasse', 'Ouvert tôt'],
      pratique: {
        adresse: '45, avenue de la Science, Lemba',
        horaires: 'Lundi – samedi · 6 h 30 – 20 h',
        capacite: '30 places',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Espèces CDF'],
        distance: 'Près du campus de Lemba'
      },
      creneaux: [
        { id: 'matin', nom: 'Matin', heures: '7 h 00 – 11 h 00', places: 18 },
        { id: 'apresmidi', nom: 'Après-midi', heures: '14 h 00 – 18 h 00', places: 14 }
      ],
      avisList: [
        { auteur: 'Berthe Nzita', date: '18 juin', note: 4, texte: 'Le bissap maison est parfait et le prix correct pour un étudiant.' },
        { auteur: 'Junior Mavinga', date: '8 juin', note: 5, texte: 'On y révise sans être pressé. Le patron laisse rester.' },
        { auteur: 'Sylvie Kabongo', date: '27 mai', note: 4, texte: 'Simple, propre, service rapide le matin.' }
      ]
    },
    {
      id: 'nuit-rumba',
      numero: 9,
      titre: 'Nuit Rumba Live',
      categorie: 'evenement',
      commune: 'Barumbu',
      quartier: 'Avenue Kabambare',
      resume: 'Sept groupes, une seule scène, de 20 h à l’aube. Guitares sebene, cuivres et quelques invités venus de Brazzaville.',
      note: 4.7,
      avis: 156,
      aPartirDe: priceOf(12),
      unite: 'le billet',
      image: 'assets/img/fiche-rumba.jpg',
      galerie: ['assets/img/fiche-rumba.jpg', 'assets/img/galerie-scene.jpg'],
      legende: 'Montage de la scène, fin d’après-midi',
      fort: ['Sept groupes', 'Vestiaire', 'Bar sur place', 'Navette retour'],
      pratique: {
        adresse: 'Salle Kabambare, Barumbu',
        horaires: 'Portes 19 h 30 · fin 4 h',
        capacite: '1 200 places',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Carte bancaire'],
        distance: '10 min du rond-point Kasa-Vubu'
      },
      billets: [
        { id: 'debut', nom: 'Entrée debout', details: 'Accès fosse · placement libre', prix: priceOf(12), restant: 320 },
        { id: 'assise', nom: 'Balcon assis', details: 'Place numérotée · vue sur scène', prix: priceOf(24), restant: 84 },
        { id: 'loge', nom: 'Loge 4 places', details: 'Table, service au siège, vestiaire inclus', prix: priceOf(120), restant: 6 }
      ],
      avisList: [
        { auteur: 'Tshala Muana K.', date: '21 juin', note: 5, texte: 'Programmation sérieuse, son correct pour la salle. Le billet numérique a évité la file.' },
        { auteur: 'Didier Nkulu', date: '22 juin', note: 4, texte: 'Le balcon assis vaut le supplément. Sortie bien organisée vers 4 h.' },
        { auteur: 'Esther Mbuyi', date: '14 juin', note: 5, texte: 'On a dansé jusqu’au bout. Vestiaire gratuit avec la loge.' }
      ]
    },
    {
      id: 'festival-ndombolo',
      numero: 10,
      titre: 'Festival Ndombolo — Journée 2',
      categorie: 'evenement',
      commune: 'Masina',
      quartier: 'Esplanade de Masina',
      resume: 'Concours de danse, ateliers et concerts en plein air. Journée conçue pour les familles, entrée par créneau horaire.',
      note: 4.5,
      avis: 97,
      aPartirDe: priceOf(8),
      unite: 'le billet',
      image: 'assets/img/fiche-ndombolo.jpg',
      galerie: ['assets/img/fiche-ndombolo.jpg', 'assets/img/galerie-scene.jpg'],
      legende: 'Esplanade avant l’ouverture des portes',
      fort: ['Ateliers danse', 'Espace familles', 'Restauration', 'Sécurité renforcée'],
      pratique: {
        adresse: 'Esplanade de Masina',
        horaires: 'Journée · 11 h – 23 h',
        capacite: '5 000 places',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Espèces CDF'],
        distance: 'Bus directs depuis Ndjili'
      },
      billets: [
        { id: 'jour', nom: 'Pass journée', details: 'Accès complet, une entrée', prix: priceOf(8), restant: 1200 },
        { id: 'famille', nom: 'Pass famille', details: '2 adultes + 2 enfants', prix: priceOf(24), restant: 180 },
        { id: 'atelier', nom: 'Pass journée + atelier', details: 'Pass + atelier danse 1 h avec un chorégraphe', prix: priceOf(18), restant: 40 }
      ],
      avisList: [
        { auteur: 'Prisca Ndaya', date: '16 juin', note: 5, texte: 'L’atelier danse était le vrai plus : les enfants sont repartis avec les pas.' },
        { auteur: 'Moïse Tembo', date: '16 juin', note: 4, texte: 'Bonne organisation à l’entrée, prévoir de l’eau. Scène bien sonorisée.' },
        { auteur: 'Gisèle Mputu', date: '15 juin', note: 4, texte: 'Journée longue, mais l’espace familles est ombragé et surveillé.' }
      ]
    },
    {
      id: 'coucher-fleuve',
      numero: 11,
      titre: 'Coucher de soleil sur le fleuve',
      categorie: 'experience',
      commune: 'Ngaliema',
      quartier: 'Embarcadère de Kinkole',
      resume: 'Deux heures de pirogue sur le fleuve, à l’heure où la lumière tombe. Guide piroguier, boissons fraîches et musique acoustique à bord.',
      note: 4.9,
      avis: 142,
      aPartirDe: priceOf(35),
      unite: 'par personne',
      image: 'assets/img/fiche-fleuve.jpg',
      galerie: ['assets/img/fiche-fleuve.jpg', 'assets/img/galerie-canoe.jpg'],
      legende: 'Départ de l’embarcadère, fin d’après-midi',
      fort: ['Guide local', 'Gilets de sauvetage', 'Boissons incluses', 'Petits groupes'],
      pratique: {
        adresse: 'Embarcadère de Kinkole, Ngaliema',
        horaires: 'Tous les jours · départ 16 h 45',
        capacite: '2 pirogues · 12 personnes',
        langues: 'Français, lingala',
        paiement: ['Mobile money', 'Espèces USD'],
        distance: 'Retour prévu vers 19 h 15'
      },
      sessions: [
        { id: 's1', nom: 'Mercredi 24 juin', heures: '16 h 45 – 19 h 15', places: 5 },
        { id: 's2', nom: 'Vendredi 26 juin', heures: '16 h 45 – 19 h 15', places: 2 },
        { id: 's3', nom: 'Samedi 27 juin', heures: '16 h 45 – 19 h 15', places: 8 }
      ],
      avisList: [
        { auteur: 'Chantal Lelo', date: '19 juin', note: 5, texte: 'Le silence sur l’eau au coucher du soleil, puis la rumba acoustique : deux heures parfaites.' },
        { auteur: 'Olivier Bongongo', date: '12 juin', note: 5, texte: 'Guide très documenté sur le fleuve et les îles. Gilets fournis, tout était clair.' },
        { auteur: 'Ruth Muteba', date: '2 juin', note: 5, texte: 'Réservé la veille depuis le téléphone, paiement Orange Money. Départ à l’heure.' }
      ]
    },
    {
      id: 'sape-matonge',
      numero: 12,
      titre: 'Sape & Matonge à pied',
      categorie: 'experience',
      commune: 'Kalamu',
      quartier: 'Matonge',
      resume: 'Trois heures de marche avec un sapeur de la troisième génération : ateliers de tailleurs, bars à vinyles et histoires du quartier.',
      note: 4.8,
      avis: 119,
      aPartirDe: priceOf(25),
      unite: 'par personne',
      image: 'assets/img/fiche-sape.jpg',
      galerie: ['assets/img/fiche-sape.jpg', 'assets/img/galerie-rue.jpg'],
      legende: 'Départ devant l’atelier, avenue Kasa-Vubu',
      fort: ['Guide sapeur', 'Dégustation incluse', 'Groupe de 8 max', 'Parcours 3 h'],
      pratique: {
        adresse: 'Rendez-vous devant l’atelier, avenue Kasa-Vubu',
        horaires: 'Mercredi et samedi · 9 h et 15 h',
        capacite: '8 personnes par départ',
        langues: 'Français, lingala, anglais',
        paiement: ['Mobile money', 'Espèces USD'],
        distance: '2,8 km de marche, rythme tranquille'
      },
      sessions: [
        { id: 's1', nom: 'Samedi 28 juin', heures: '9 h 00 – 12 h 00', places: 3 },
        { id: 's2', nom: 'Samedi 28 juin', heures: '15 h 00 – 18 h 00', places: 6 },
        { id: 's3', nom: 'Mercredi 2 juillet', heures: '9 h 00 – 12 h 00', places: 8 }
      ],
      avisList: [
        { auteur: 'Hervé Kalonji', date: '18 juin', note: 5, texte: 'On ressort avec les noms des tailleurs et l’envie de revenir. Le guide raconte très bien.' },
        { auteur: 'Fatou Nsimba', date: '10 juin', note: 5, texte: 'Trois heures passées sans les voir. La dégustation chez le vendeur de beignets est un bonus.' },
        { auteur: 'Michel Tshilombo', date: '31 mai', note: 4, texte: 'Parcours exigeant sous le soleil, prévoir de l’eau. Contenu passionnant.' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     Témoignages de la page d’accueil (synthétiques, assumés)
     ------------------------------------------------------------------------ */
  const TEMOIGNAGES = [
    { texte: 'J’ai réservé une table à Matonge depuis le bus, payée avec M-Pesa. La table était prête.', auteur: 'Mbuyi K.', lieu: 'Kalamu' },
    { texte: 'Enfin une plateforme qui écrit mes prix en dollars et en francs congolais.', auteur: 'Nadine T.', lieu: 'Ngaliema' },
    { texte: 'Le week-end de mes parents venus de Bruxelles : hôtel, restaurant et une pirogue au coucher du soleil.', auteur: 'Serge I.', lieu: 'Gombe' }
  ];

  /* ------------------------------------------------------------------------
     Moyens de paiement
     ------------------------------------------------------------------------ */
  const PAIEMENTS = [
    { id: 'mpesa', nom: 'M-Pesa', type: 'mobile', texte: 'Validation par SMS sur votre téléphone.' },
    { id: 'orange', nom: 'Orange Money', type: 'mobile', texte: 'Code de confirmation à six chiffres.' },
    { id: 'airtel', nom: 'Airtel Money', type: 'mobile', texte: 'Débit direct du compte mobile.' },
    { id: 'carte', nom: 'Carte bancaire', type: 'carte', texte: 'Visa et Mastercard, paiement en dollars.' },
    { id: 'cash', nom: 'Espèces sur place', type: 'cash', texte: 'Uniquement si le lieu l’accepte.' }
  ];

  /* ------------------------------------------------------------------------
     Réassurance
     ------------------------------------------------------------------------ */
  const REASSURANCE = [
    { icone: 'shield', titre: 'Paiement retenu jusqu’à l’arrivée', texte: 'L’établissement n’est payé qu’après votre entrée. En cas d’absence, le montant est remboursé sous 72 heures.' },
    { icone: 'phone', titre: 'Mobile money d’abord', texte: 'M-Pesa, Orange Money et Airtel Money sont proposés au même niveau que la carte bancaire, avec confirmation par SMS.' },
    { icone: 'check', titre: 'Adresses visitées', texte: 'Chaque fiche est vérifiée sur place : eau, électricité, accès, sécurité et prix réel constaté.' },
    { icone: 'compass', titre: 'Avis nominatifs', texte: 'Seuls les clients ayant honoré une réservation peuvent noter. Les avis ne sont ni filtrés ni supprimés.' }
  ];

  /* ------------------------------------------------------------------------
     Tri / filtres
     ------------------------------------------------------------------------ */
  const TRIS = [
    { id: 'pertinence', nom: 'Pertinence' },
    { id: 'prix-croissant', nom: 'Prix croissant' },
    { id: 'prix-decroissant', nom: 'Prix décroissant' },
    { id: 'note', nom: 'Mieux notés' }
  ];

  return {
    TAUX_USD_CDF, usd, cdf, priceOf,
    VILLES, CATEGORIES, FICHES, TEMOIGNAGES, PAIEMENTS, REASSURANCE, TRIS
  };
})();
