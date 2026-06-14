Oui. Là on arrête le brainstorming et on passe en document de conception complet pour Codex.

L’objectif n’est pas de faire une “jolie page”. L’objectif est de créer une expérience de candidature Red Bull-inspired, avec un début, une progression, une tension, des preuves, des objections levées, puis une décision finale.

Je vais te décrire le site comme un film interactif. Une personne qui ne code pas doit pouvoir le dessiner scène par scène. Codex pourra ensuite transformer ça en composants, animations, sections, CTA et interactions.

Site candidature Red Bull — Storyboard complet de l’expérience interactive

Intention générale

Ce site est une candidature interactive pour Eddy Sallault, pensée dans l’esprit Red Bull : énergie, audace, performance, humour, mouvement, sport, distribution terrain et exécution.

Le site ne doit pas ressembler à un CV classique. Il doit donner l’impression que le recruteur entre dans une mini-expérience de marque, presque comme dans un centre logistique imaginaire où l’on fabrique, teste, attribue et livre des “ailes”.

L’idée centrale est simple :

Eddy ne dit pas seulement qu’il est créatif, structuré, manager, orienté terrain et capable de sortir du lot. Il le prouve par la forme même de sa candidature.

Le site doit créer un effet “whaou”, mais chaque effet visuel doit avoir une fonction. Rien ne doit être gratuit. Chaque animation doit révéler une compétence, une preuve ou une réponse à une objection.

La promesse du site :

“Voici comment je sors du lot. Voici pourquoi je ne suis pas un candidat standard. Voici pourquoi mon profil peut apporter de la valeur à Red Bull.”

⸻

Architecture générale du parcours

Le site se déroule en 9 grandes scènes :

1. L’arrivée : “Avez-vous une paire d’ailes disponible ?”
2. L’ouverture de l’expérience : vidéo des canettes
3. Le Wingfinder Pack : 4 forces, 4 canettes, 4 preuves
4. Le scanner du profil : lecture rapide du potentiel
5. La scène F1 + remorque : transformer l’énergie en exécution terrain
6. Les stories de carrière : preuves concrètes reliées au poste
7. Le mur des objections : les freins apparents sont analysés et levés
8. La création des ailes : vidéo de la paire d’ailes qui sort de la boîte
9. La décision finale : quelle action le recruteur choisit-il ?

Le recruteur doit pouvoir vivre l’expérience en 60 à 90 secondes s’il survole, mais aussi creuser chaque bloc s’il veut lire les preuves détaillées.

⸻

Bibliothèques et logique technique recommandées

Le site peut être construit en React/Vite ou Next.js.

Les animations principales doivent utiliser GSAP, notamment ScrollTrigger, pour contrôler les séquences au scroll. GSAP est adapté pour les animations premium, les effets de révélation, les timelines, les transitions précises et les scènes qui se déclenchent au bon moment.

Motion peut être utilisé pour les micro-interactions : boutons, cartes, hover, clic, apparition de modales, transitions douces entre états.

Lottie ou dotLottie peut être utilisé pour de petites animations vectorielles : checkmarks, scan, jauges, petites ailes, icônes “unlocked”, loader, validation finale.

Les vidéos doivent être intégrées en HTML5 video, en autoplay muted playsinline loop, avec image poster. Sur mobile, chaque vidéo doit avoir une version optimisée ou une image de remplacement si la vidéo est trop lourde.

Le site doit respecter prefers-reduced-motion : si l’utilisateur a réduit les animations dans son système, les effets doivent être remplacés par des transitions simples.

Le site doit être très rapide. Les vidéos ne doivent pas toutes charger immédiatement. Utiliser lazy loading, preload metadata, poster images, et chargement progressif.

⸻

SCÈNE 1 — Arrivée sur le site : “Avez-vous une paire d’ailes disponible ?”

Ce que voit le recruteur

Le recruteur arrive sur une page très propre, visuellement impactante. L’écran est presque vide au départ. Le fond peut être blanc argenté, avec une légère texture métal ou froid industriel premium. On doit sentir Red Bull sans faire une copie agressive : bleu profond, rouge, jaune, argent, lumière, énergie.

Au centre, une phrase apparaît progressivement :

“Avez-vous une paire d’ailes disponible ?”

La phrase ne doit pas arriver brutalement. Elle doit se construire comme un signal qui s’active.

D’abord un léger bruit visuel de lumière, puis le texte apparaît ligne par ligne. Le mot “ailes” peut avoir une micro-animation : deux petites formes d’ailes stylisées apparaissent autour du mot, puis disparaissent.

Sous le titre, une phrase courte :

“Je suis Eddy Sallault. J’ai construit cette candidature comme je travaille : avec énergie, structure, créativité et preuves terrain.”

Puis un bouton principal :

“Entrer dans l’expérience”

Et un bouton secondaire plus discret :

“Voir le CV directement”

Animation

Au chargement :

* Fond très légèrement animé avec un gradient lumineux.
* Le titre arrive avec une animation GSAP : opacity 0 vers 1, léger déplacement vertical.
* Le bouton principal pulse une seule fois, pas en boucle permanente.
* Le logo ou symbole visuel principal peut avoir un léger effet de lumière qui passe de gauche à droite.

Comportement des boutons

Bouton “Entrer dans l’expérience” :

* Scroll fluide vers la scène 2.
* Déclenche la vidéo des canettes.
* Le bouton peut faire un petit effet “lift off” au clic : légère montée, ombre, flash subtil.

Bouton “Voir le CV directement” :

* Ouvre une modale ou scroll vers une section CV en bas de page.
* Il ne doit pas casser l’expérience. Le CV reste disponible pour les recruteurs pressés.
* Dans la modale CV, ajouter un bouton “Reprendre l’expérience interactive”.

Objectif RH de cette scène

Créer la curiosité immédiatement. Le recruteur doit comprendre que ce n’est pas un CV classique. Mais il doit aussi sentir que ce n’est pas un délire vide : Eddy annonce dès le départ que la créativité est reliée à des preuves terrain.

⸻

SCÈNE 2 — Vidéo des canettes : activation du Wingfinder Pack

Ce que voit le recruteur

Après avoir cliqué sur “Entrer dans l’expérience”, la vidéo des canettes démarre. Elle doit être utilisée comme transition d’entrée dans l’univers.

La vidéo montre les canettes avec un effet premium, énergétique, vivant. Elle n’est pas seulement décorative. Elle symbolise le début de l’analyse Wingfinder.

Sur la vidéo, un overlay textuel apparaît :

“Wingfinder gave the signal.”

Puis :

“My career gives the proof.”

Puis en français ou anglais selon la version choisie :

“4 forces. 4 preuves. 1 profil terrain.”

Animation

La vidéo peut se lancer en plein écran ou dans un grand bloc arrondi avec cadre premium.

Pendant la vidéo :

* Une barre de progression fine apparaît en bas de la vidéo.
* À la fin de la vidéo, les 4 forces apparaissent autour ou sous les canettes.
* Les canettes deviennent cliquables, ou la page transitionne vers la scène 3 où elles sont présentées comme objets interactifs.

Comportement

Si la vidéo est terminée :

* Transition automatique vers le Wingfinder Pack.
* Bouton “Découvrir les forces” devient actif.

Si le recruteur clique avant la fin :

* On passe directement à la scène 3.
* Il ne faut jamais forcer le recruteur à attendre.

Sur mobile :

* La vidéo doit rester courte, légère, muette.
* Si la vidéo ne charge pas, afficher l’image poster avec un effet de zoom lent.

Objectif RH

Montrer que l’expérience commence par quelque chose de ludique, mais que tout va être relié au profil de personnalité et aux preuves professionnelles.

⸻

SCÈNE 3 — Wingfinder Pack : 4 canettes, 4 forces, 4 preuves

Ce que voit le recruteur

Le recruteur arrive devant un frigo ou un pack de 4 canettes. Chaque canette correspond à une force du profil Wingfinder.

Les 4 canettes doivent être clairement identifiées, sans surcharger :

1. Drive
2. Creativity
3. Connections
4. Thinking

Chaque canette a une couleur ou un univers visuel différent, mais l’ensemble doit rester cohérent.

Au-dessus :

“Open the energy. Read the proof.”

Ou en français :

“Ouvrez l’énergie. Découvrez la preuve.”

Interaction principale

Quand le recruteur survole une canette :

* La canette avance légèrement.
* Une lumière apparaît derrière elle.
* Un mini-label s’affiche : “Drive”, “Creativity”, etc.
* Sur mobile, le hover est remplacé par un simple tap.

Quand il clique :

* La canette s’ouvre avec un effet “pschitt” visuel.
* Une carte latérale ou une carte centrale s’ouvre.
* La carte contient 4 niveaux :
    1. La force
    2. Ce que cela signifie chez Eddy
    3. La preuve carrière
    4. L’application possible chez Red Bull

Contenu de la canette Drive

Titre :
“Drive — créer de la traction là où rien n’est encore installé.”

Explication :
“Mon énergie ne consiste pas seulement à travailler beaucoup. Elle consiste à lancer, structurer et faire avancer des environnements où il n’y a pas encore de dynamique établie.”

Preuve :
“Chez SAMSIC, j’ai contribué à créer un développement régional à partir de bases très faibles, avec ouverture d’agences, construction d’équipes et croissance commerciale jusqu’à un périmètre significatif.”

Application Red Bull :
“Sur un territoire commercial, cette énergie sert à installer du rythme, pousser l’exécution, donner une direction claire et transformer une ambition en présence terrain.”

CTA :
“Lire la story : construire un territoire”

Action du CTA :
Ouvre une modale story ou scroll vers la scène 6 correspondante.

Contenu de la canette Creativity

Titre :
“Creativity — transformer une friction en système.”

Explication :
“Ma créativité n’est pas décorative. Elle sert à rendre les choses plus simples, plus lisibles, plus rapides et plus actionnables.”

Preuve :
“J’ai créé des outils, des process, des pages, des systèmes de formation et des supports digitaux pour résoudre des problèmes concrets de terrain.”

Application Red Bull :
“Dans une équipe sales, cette créativité peut aider à mieux former, mieux suivre, mieux expliquer, mieux prioriser et mieux engager les équipes.”

CTA :
“Lire la story : créer un système utile”

Contenu de la canette Connections

Titre :
“Connections — créer l’adhésion avant d’exiger la performance.”

Explication :
“Je ne crois pas au management uniquement descendant. Une équipe performe quand elle comprend le cap, le cadre, les attentes et le sens de l’action.”

Preuve :
“J’ai recruté, formé et fait progresser des profils parfois non issus du métier, en créant un environnement d’apprentissage rapide et de confiance.”

Application Red Bull :
“Pour manager des équipes terrain, cette force permet d’aligner les personnes, d’installer une culture d’exécution et de faire progresser sans micro-manager.”

CTA :
“Lire la story : former une équipe qui avance”

Contenu de la canette Thinking

Titre :
“Thinking — voir le système derrière l’action.”

Explication :
“Je ne regarde pas seulement ce qui bloque. Je cherche pourquoi cela bloque, où se trouve le levier, et comment créer une méthode reproductible.”

Preuve :
“Dans mes expériences, j’ai souvent structuré des méthodes, des routines, des indicateurs, des formations et des diagnostics pour transformer l’intuition en progression visible.”

Application Red Bull :
“Dans un environnement retail, cette force permet de lire un territoire, comprendre les écarts d’exécution, prioriser les actions et faire monter l’équipe en compétence.”

CTA :
“Lire la story : structurer la performance”

État de progression

Après chaque canette ouverte, un indicateur se valide :

* Drive unlocked
* Creativity unlocked
* Connections unlocked
* Thinking unlocked

Quand les 4 sont ouvertes, un message apparaît :

“Energy unlocked. Now let’s scan the profile.”

Bouton :
“Scanner le profil”

Objectif RH

Montrer que les forces Wingfinder ne sont pas des mots. Elles sont reliées à des comportements, des preuves et des applications concrètes pour Red Bull.

⸻

SCÈNE 4 — Scanner du profil : assumer le profil atypique

Ce que voit le recruteur

La scène ressemble à un scanner logistique ou à un contrôle qualité. On scanne non pas une canette, mais une fiche candidat.

Visuel possible :

* Une carte “Eddy Sallault — Field Builder Profile”
* Un faisceau lumineux descend de haut en bas.
* Des lignes apparaissent comme dans un diagnostic.

Le ton est décalé, mais le fond est sérieux.

Texte principal

“Scan the profile.”

Puis :

“Not a traditional retail candidate. But a proven field builder.”

En français possible :

“Pas un profil retail classique. Mais un constructeur de terrain déjà éprouvé.”

Animation

Le scan passe sur la carte.
À chaque passage, une ligne s’active :

* Field leadership: proven
* Territory building: proven
* Team training: proven
* Business development: proven
* Creative execution: proven
* Retail experience: to calibrate
* Ottawa relocation: manageable
* Work authorization: to clarify / solution-oriented

Important : les points sensibles ne doivent pas être cachés. Ils doivent apparaître, mais avec un statut intelligent.

Par exemple :

* “Retail experience: not traditional — transferable field leadership”
* “Ottawa: relocation-ready”
* “Work authorization: needs process — open to structured solution”

Interaction

Chaque ligne du scanner peut être cliquable.

Quand on clique sur “Retail experience: not traditional” :
Une petite carte s’ouvre :
“C’est vrai : mon parcours n’est pas celui d’un candidat retail classique. Mais mes expériences sont profondément terrain : développement commercial, équipes, clients, exécution, formation, rythme et performance. La question n’est donc pas seulement ‘a-t-il déjà fait exactement ce poste ?’, mais ‘peut-il apprendre vite et structurer un territoire ?’”

Quand on clique sur “Ottawa: relocation-ready” :
Carte :
“Je ne suis pas actuellement basé à Ottawa. Mais mon parcours montre une capacité réelle à changer de terrain, m’adapter et construire dans un nouvel environnement. La mobilité n’est pas un frein si le projet est clair.”

Quand on clique sur “Work authorization” :
Carte :
“Le sujet immigration/travail doit être clarifié dans le bon cadre. Je ne le minimise pas. Mais je l’aborde comme un sujet de process : identifier les options, valider la faisabilité, avancer proprement. Ce n’est pas un manque de motivation, c’est un point à structurer.”

Bouton

“Voir comment cela se traduit sur le terrain”

Action :
Scroll vers la scène F1 + remorque.

Objectif RH

Cette scène prépare les objections avant la fin. Elle montre que Eddy n’est pas naïf. Il sait ce que le recruteur va penser. Il ne cache pas les freins, il les transforme en discussion structurée.

⸻

SCÈNE 5 — F1 + remorque : From Energy to Field Execution

Ce que voit le recruteur

C’est la scène signature.

On voit la vidéo ou l’image animée de la F1 qui tire une remorque Red Bull vers un quai de livraison. L’image est décalée, drôle, mais la scène logistique doit rester crédible : quai arrière, remorque à portes arrière, palettes, mouvement maîtrisé.

Titre :

“Speed is nothing without execution.”

Sous-titre :

“The brand creates energy. The field creates results. The manager connects both.”

En français possible :

“La marque crée l’énergie. Le terrain crée le résultat. Le manager relie les deux.”

Animation

La vidéo F1 + remorque se lance quand la scène entre dans le viewport.

Si la vidéo est courte :

* Elle peut boucler doucement.
* Ajouter une légère superposition de texte qui arrive au bon moment.

Si l’on utilise une image fixe :

* Faire un léger effet caméra avec GSAP : zoom lent, déplacement horizontal très subtil.
* Ajouter des reflets, particules de pluie, lumière de quai.
* Faire apparaître les palettes une par une avec une animation légère.

Blocs explicatifs

Sous l’image ou à côté, trois cartes apparaissent :

Carte 1 — Speed

“L’énergie donne l’impulsion. Mais l’impulsion seule ne suffit pas.”

Carte 2 — Precision

“Une équipe terrain a besoin de timing, de routines, de priorités et d’un cadre clair.”

Carte 3 — Delivery

“Le résultat arrive quand la marque, les personnes, la logistique et l’exécution magasin avancent ensemble.”

Interaction

Chaque carte peut être cliquée.

Clic sur Speed :
Affiche une mini-story sur Drive : “Quand j’ai dû partir de zéro, j’ai appris à créer de la traction sans attendre que toutes les conditions soient parfaites.”

Clic sur Precision :
Affiche une mini-story sur Thinking : “J’ai appris à structurer l’action avec des routines, des formations et des indicateurs.”

Clic sur Delivery :
Affiche une mini-story sur Connections : “Une exécution durable dépend de l’équipe, pas seulement du plan.”

CTA

“Découvrir les preuves terrain”

Action :
Scroll vers la scène stories.

Objectif RH

Relier la partie fun à une compréhension réelle du métier : distribution, terrain, logistique, management, rythme, exécution.

⸻

SCÈNE 6 — Stories de carrière : preuves reliées au poste

Ce que voit le recruteur

La scène devient plus sérieuse, mais reste dynamique. On ne perd pas l’univers. On peut présenter les stories comme des “missions” ou des “cartouches d’énergie”.

Titre :

“Proof, not claims.”

Sous-titre :

“Chaque force est reliée à une situation réelle.”

Les stories sont présentées en cartes interactives. Chaque carte a :

* un titre court
* une compétence Red Bull associée
* une preuve
* un bouton “Open story”

Stories principales recommandées

Story 1 — Construire un territoire

Titre :
“From zero to regional footprint”

Compétence :
Drive / Territory building

Contenu :
“Créer une présence commerciale là où il n’y avait pas encore de base solide. Ouvrir, recruter, former, installer une dynamique, développer les clients et structurer la progression.”

Lien Red Bull :
“Développer un territoire demande la même logique : comprendre le terrain, prioriser, créer du rythme et faire progresser l’exécution.”

CTA :
“Open story”

Effet :
La carte s’agrandit en plein écran ou en modale. Le fond devient une carte stylisée.

Story 2 — Former des profils atypiques

Titre :
“Build the team before chasing the numbers”

Compétence :
Connections / People development

Contenu :
“Recruter et former des profils non issus du métier pour éviter les mauvais automatismes, créer des routines et faire monter l’autonomie.”

Lien Red Bull :
“Une équipe de terrain performante ne dépend pas seulement de l’expérience passée. Elle dépend de la qualité du cadre, de l’apprentissage et du coaching.”

Story 3 — Transformer la friction en outil

Titre :
“Turn friction into system”

Compétence :
Creativity / Process design

Contenu :
“Créer des outils, supports, process ou interfaces pour fluidifier le travail, clarifier les priorités et rendre l’action plus simple.”

Lien Red Bull :
“Dans une équipe sales, les meilleurs systèmes sont ceux qui réduisent la friction entre stratégie, terrain et exécution.”

Story 4 — Coach sportif : créer une progression durable

Titre :
“Performance is trained before it is expected”

Compétence :
Thinking / Coaching / Progression

Contenu :
“L’expérience de coach apprend une règle essentielle : on ne décrète pas la performance. On construit les conditions pour qu’elle apparaisse.”

Lien Red Bull :
“Manager une équipe terrain, c’est aussi entraîner : observer, corriger, répéter, mesurer, encourager, ajuster.”

Animation

Les cartes arrivent comme des caisses sur un convoyeur ou comme des dossiers qui s’activent.

Au hover :

* La carte se soulève.
* Une petite étiquette apparaît : “Field proof”
* Un léger effet de lumière passe.

Au clic :

* Transition Motion en modale.
* Le reste de la page se floute légèrement.
* La story apparaît en format narratif court.

Bouton global

“Voir les questions que vous vous posez sûrement”

Action :
Scroll vers la scène objections.

Objectif RH

Après le spectacle, donner les preuves. Le recruteur doit comprendre que derrière le concept créatif, il y a un vrai fond professionnel.

⸻

SCÈNE 7 — Le mur des objections : transformer les freins en sujets maîtrisés

Ce que voit le recruteur

Cette scène est très importante. Elle doit arriver vers la fin, quand le recruteur commence à être intéressé mais peut penser :

“Oui, c’est créatif… mais il n’a pas forcément l’expérience retail.”
“Il n’habite pas à Ottawa.”
“Il y a peut-être un sujet de droit au travail.”
“Est-ce trop atypique ?”
“Est-ce qu’il sera crédible face à une équipe terrain ?”

On doit créer un visuel fort : un mur de contrôle, un rayon avec des voyants rouges, ou une check-list de lancement avec des warnings.

Titre :

“Before takeoff, let’s clear the red flags.”

Ou en français :

“Avant le décollage, levons les vrais sujets.”

Sous-titre :

“Je sais probablement quelles questions vous vous posez. Je préfère les traiter clairement.”

Visuel

Un panneau de contrôle avec 4 ou 5 voyants rouges :

1. “No direct retail background?”
2. “Not based in Ottawa?”
3. “Work authorization?”
4. “Too atypical?”
5. “Can he lead a Red Bull field team?”

Chaque voyant est cliquable.

Quand le recruteur clique sur un voyant, l’animation transforme le voyant rouge en voyant jaune puis vert. Une réponse apparaît. Le frein n’est pas nié. Il est clarifié, cadré et réduit.

Objection 1 — “Il n’a pas l’expérience retail classique”

Texte du voyant :
“Retail background?”

Au clic :
Le voyant s’ouvre. Un scanner compare “traditional retail profile” et “field builder profile”.

Réponse :
“C’est le point le plus évident. Mon parcours n’est pas celui d’un candidat qui a passé toute sa carrière en grande distribution. Mais mon expérience est profondément terrain : développement commercial, gestion de clients, équipes, formation, exécution, objectifs, rythme, pression et adaptation. Je ne prétends pas connaître chaque spécificité retail dès le premier jour. Je prétends pouvoir apprendre vite, comprendre le système, poser les bonnes questions et transformer mon expérience terrain en valeur.”

Message final :
“Frein réel ? Oui, à calibrer. Frein bloquant ? Pas nécessairement.”

État :
Le voyant passe de rouge à vert avec le label :
“Transferable field leadership”

Objection 2 — “Il n’habite pas à Ottawa”

Texte du voyant :
“Based in Ottawa?”

Au clic :
Une mini-carte s’affiche. Une trajectoire part de Florida / current location vers Ottawa. Pas besoin de carte géographique exacte. On peut utiliser une trajectoire stylisée.

Réponse :
“Je ne suis pas basé à Ottawa aujourd’hui. Mais mon parcours montre que je sais changer de territoire, repartir de zéro et m’adapter rapidement à un nouvel environnement. Si le rôle et le projet sont cohérents, la mobilité se traite comme un plan, pas comme un obstacle.”

Message final :
“Frein réel ? Logistique. Frein bloquant ? Non si le projet est clair.”

État :
“Relocation-ready mindset”

Objection 3 — “Droit au travail / visa”

Texte du voyant :
“Work authorization?”

Au clic :
Une animation type “process map” s’ouvre. On voit trois étapes :

1. Clarify
2. Validate
3. Structure

Réponse :
“Ce sujet doit être traité proprement et factuellement. Je ne le minimise pas. Il faut clarifier le cadre possible, les options, les délais et la faisabilité. Mais c’est précisément le type de sujet que j’aborde avec méthode : identifier les contraintes, vérifier les solutions, avancer sans improviser.”

Message final :
“Frein réel ? Oui, administratif. Frein bloquant ? À valider, pas à supposer.”

État :
“Needs structured review”

Important :
Ne pas promettre une autorisation de travail si elle n’est pas garantie. Le site doit rester honnête.

Objection 4 — “Profil trop atypique ?”

Texte du voyant :
“Too atypical?”

Au clic :
Une animation montre une canette qui ne rentre pas dans un rayon standard, puis le rayon s’ajuste pour révéler une meilleure catégorie : “Builder profile”.

Réponse :
“Oui, mon profil est atypique. Mais c’est précisément la raison de cette candidature. Un profil standard peut rassurer. Un profil atypique peut apporter un angle différent, à condition d’avoir des preuves solides. Ici, l’originalité n’est pas un décor : elle reflète ma manière de penser, construire et agir.”

Message final :
“Atypical does not mean random. It means different evidence.”

État :
“High-potential builder”

Objection 5 — “Peut-il manager une équipe Red Bull terrain ?”

Texte du voyant :
“Field team leadership?”

Au clic :
Animation de huddle / équipe / pit stop. Les rôles s’allument :

* direction
* training
* rhythm
* feedback
* accountability

Réponse :
“Manager une équipe terrain, c’est créer un cadre dans lequel les gens savent quoi regarder, quoi améliorer et comment progresser. Mon expérience de management, de formation et de coaching m’a appris à installer ce type de dynamique.”

Message final :
“Le sujet n’est pas seulement l’autorité. Le sujet est le rythme, la clarté, l’apprentissage et l’exécution.”

État :
“Leadership pattern proven”

Comportement global

Quand tous les voyants ont été cliqués ou quand le recruteur clique sur “Clear all” :

* Les voyants passent au vert.
* Un message apparaît :

“Risks identified. Questions clarified. Potential still active.”

Puis :

“Ready for wings assignment.”

CTA :
“Créer la paire d’ailes”

Action :
Scroll vers la scène vidéo des ailes qui sortent de la boîte.

Objectif RH

Cette scène est essentielle. Elle transforme les faiblesses apparentes en discussion adulte. Elle montre que Eddy n’est pas dans l’esbroufe, qu’il sait anticiper les objections, les traiter avec méthode et ne pas promettre n’importe quoi.

⸻

SCÈNE 8 — Création des ailes : vidéo de la paire d’ailes qui s’envole de la boîte

Ce que voit le recruteur

Après avoir levé les objections, le site lance une scène plus émotionnelle.

Une boîte s’ouvre. Une paire d’ailes s’envole. C’est la vidéo disponible.

Le ton doit être magique, mais pas enfantin. Premium, énergique, symbolique.

Titre :

“Wings are not given. They are earned.”

En français :

“Les ailes ne se réclament pas. Elles se méritent.”

Sous-titre :

“Ce parcours n’était pas conçu pour faire joli. Il était conçu pour montrer ma manière de penser, de construire et d’exécuter.”

Animation

La vidéo démarre au scroll.
Pendant que les ailes sortent de la boîte :

* Les forces débloquées reviennent autour :
    * Drive
    * Creativity
    * Connections
    * Thinking
    * Execution
    * Field leadership
* Les mots apparaissent brièvement puis se fondent dans les ailes.

À la fin de la vidéo :
Un statut apparaît :

“Wings generated.”

Puis :

“Final assignment pending.”

Interaction

Bouton :
“Voir la paire d’ailes s’avancer”

Action :
Lance la dernière vidéo ou scroll vers la scène 9.

Objectif RH

Créer un moment mémorable. Le recruteur doit sentir que le parcours arrive à une conclusion. On ne demande pas encore l’entretien ; on prépare la décision finale.

⸻

SCÈNE 9 — Paire d’ailes qui s’avance : décision finale

Ce que voit le recruteur

La dernière vidéo montre la paire d’ailes qui s’avance après avoir été créée. Elle doit servir de scène finale.

L’image se stabilise. Les ailes sont là, prêtes.

Titre :

“Alors… avez-vous une paire d’ailes à me confier ?”

Sous-titre :

“Si ce profil mérite une discussion, je suis prêt à l’avoir.”

En dessous, trois boutons principaux et un bouton secondaire.

Bouton 1 — “Quelle taille pour la paire d’ailes ?”

C’est le bouton le plus important. Il doit être mis en avant.

Action :

* Ouvre une modale “Calibrons l’envergure”.
* La modale propose :
    * “Échanger 15 minutes”
    * “Voir mon CV”
    * “Voir mon profil Wingfinder”
    * “Lire les stories complètes”

Texte dans la modale :
“Excellente question. Le bon sujet n’est pas seulement de savoir si j’ai des ailes, mais quelle envergure peut être pertinente : Striker, Sales Manager, General Sales Manager, ou autre rôle où mon profil de builder peut créer de la valeur.”

CTA principal :
“Planifier un échange”

Effet :
Bouton avec animation d’ailes qui s’ouvrent légèrement au hover.

Bouton 2 — “Transmettre à un autre fournisseur d’ailes”

Ton décalé, mais maîtrisé.

Action :

* Ouvre une modale humoristique.
* Message :

“Attention : transmettre ce profil à un autre fournisseur d’ailes pourrait créer une anomalie concurrentielle.”

Puis plus sérieux :

“Si vous pensez que cette candidature doit être vue par une autre personne de l’équipe, voici un lien court à partager.”

Options :

* Copier le lien
* Ouvrir un mail pré-rempli
* Télécharger le CV

Effet :
Quand on clique “Copier le lien”, une petite animation “Link packed for delivery” apparaît.

Bouton 3 — “Désolé, rupture de stock”

Ce bouton doit être drôle mais jamais passif-agressif.

Action :
Ouvre une modale :

“Compris. Dans la distribution, le timing compte. Si les ailes d’Ottawa sont déjà prises, gardons le contact pour le prochain drop.”

Options :

* LinkedIn
* Télécharger CV
* Garder le lien

Effet :
Une étiquette “Out of stock” apparaît, puis se transforme en “Keep in reserve”.

Bouton 4 secondaire — “Voir les documents classiques”

Ce bouton doit être discret mais visible.

Action :
Ouvre un panneau avec :

* CV
* Profil Wingfinder
* Stories complètes
* Contact
* LinkedIn

Objectif :
Permettre à un recruteur classique de récupérer rapidement les éléments nécessaires.

⸻

SCÈNE OPTIONNELLE — Rayonnage des paires d’ailes

Cette scène peut être placée juste avant la scène finale, ou intégrée à la scène finale.

Ce que voit le recruteur

Un rayonnage d’entrepôt ou de magasin avec plusieurs paires d’ailes en stock.

Chaque paire a une étiquette de rôle :

* Striker
* Sales Manager
* District Sales Manager
* General Sales Manager
* Regional Builder
* Field Coach
* Territory Builder
* Execution Leader

Certaines ailes sont petites, d’autres plus grandes. Certaines sont sportives, d’autres plus corporate, d’autres plus terrain.

Au centre, une place vide ou une paire en attente :

“Pending: Eddy Sallault”

Animation

Au scroll :

* Les néons de l’entrepôt s’allument.
* Les étiquettes de rôles apparaissent.
* Les ailes bougent légèrement, comme si elles étaient prêtes à partir.
* La paire “Eddy Sallault” s’illumine progressivement.

Interaction

Chaque paire d’ailes peut être survolée :

* Striker : “field execution”
* Sales Manager : “team rhythm”
* General Sales Manager : “territory leadership”
* Regional Builder : “growth system”
* Field Coach : “people development”

Quand on clique sur “General Sales Manager” :
Une carte s’ouvre :

“High ambition. Requires calibration. But the profile brings field leadership, team development, growth mindset, creativity and system thinking.”

Quand on clique sur “Territory Builder” :
Carte :

“Strong fit with Eddy’s history: entering imperfect situations, creating structure, building teams and turning energy into execution.”

Objectif RH

Cette scène permet de poser la vraie question sans arrogance :

“Quel niveau de confiance peut-on me confier ?”

Ce n’est pas “donnez-moi le job”. C’est “discutons de l’envergure pertinente”.

⸻

Contenu transversal : navigation et expérience utilisateur

Navigation

Le site doit avoir une navigation très légère, pas un menu classique lourd.

En haut :

* Experience
* Proofs
* Red flags
* CV
* Contact

Mais sur mobile, utiliser un bouton menu discret.

Barre de progression

Une barre de progression peut apparaître sur le côté ou en bas :

1. Intro
2. Wingfinder
3. Scan
4. Execution
5. Proof
6. Red Flags
7. Wings
8. Contact

Chaque étape se valide au scroll.

Bouton flottant

Un petit bouton “Skip to decision” peut être présent après la première scène. Il permet aux recruteurs pressés d’aller directement aux CTA finaux.

Accessibilité

Les vidéos doivent avoir des posters.
Les textes doivent rester lisibles.
Les contrastes doivent être forts.
Les animations ne doivent pas empêcher la lecture.
Les modales doivent se fermer facilement.
Les boutons doivent être utilisables sur mobile.

⸻

Style visuel général

Le style doit être :

* énergique
* premium
* clair
* sportif
* corporate mais fun
* inspiré Red Bull
* jamais cheap
* jamais trop sombre
* jamais “PowerPoint”

Palette :

* blanc argenté
* bleu profond
* rouge
* jaune
* touches métalliques
* gris industriel clair

Typographie :

* titres très forts, sportifs, impactants
* textes courts, lisibles
* hiérarchie claire
* pas de paragraphes interminables dans les sections principales

Les longues stories doivent être cachées dans des modales ou sections déroulantes.

⸻

Ton éditorial

Le ton du site doit être audacieux mais professionnel.

Il faut éviter :

* “Je suis le meilleur”
* “Red Bull est mon rêve”
* “Je suis parfait”
* “Vous devez me recruter”

Il faut privilégier :

* “Voici comment je pense”
* “Voici ce que j’ai déjà construit”
* “Voici ce que je peux transférer”
* “Voici les sujets à clarifier”
* “Voici pourquoi une discussion vaut la peine”

Le site doit être confiant, pas arrogant.

⸻

Structure des assets à prévoir pour Codex

Les fichiers peuvent être organisés ainsi :

/assets/videos/

* cans-wingfinder.mp4
* f1-trailer-delivery.mp4
* wings-box-takeoff.mp4
* wings-forward.mp4

/assets/images/

* hero-poster.jpg
* cans-poster.jpg
* f1-trailer-poster.jpg
* wing-shelf.jpg
* profile-scanner.jpg
* leadership-pallet.jpg
* ottawa-map.jpg
* proof-wall.jpg
* cv-photo.jpg

/assets/logos/

* redbull-inspired-mark.svg
* wing-icon.svg
* scan-icon.svg
* delivery-icon.svg

/assets/docs/

* cv-eddy-sallault.pdf
* wingfinder-profile.pdf

⸻

Règles d’intégration pour Codex

Chaque scène doit être un composant séparé.

Composants recommandés :

* HeroIntro
* CansVideoIntro
* WingfinderPack
* ProfileScanner
* ExecutionDelivery
* CareerProofs
* ObjectionWall
* WingsCreation
* FinalDecision
* WingShelf
* CVModal
* StoryModal

Les animations GSAP doivent être regroupées proprement, avec cleanup pour éviter les bugs React.

Les images doivent être lazy-loaded.

Les vidéos doivent avoir :

* autoplay
* muted
* playsInline
* loop si nécessaire
* poster
* fallback image

Les boutons doivent avoir :

* état hover
* état focus
* état active
* feedback visuel au clic

Sur mobile :

* réduire les animations 3D
* remplacer les grandes modales par des panneaux plein écran
* garder les textes courts
* éviter les vidéos trop hautes
* prioriser la vitesse

⸻

Résumé de l’expérience en une phrase

Le recruteur entre dans une candidature qui ressemble à un univers Red Bull décalé : il ouvre les canettes du Wingfinder, scanne le profil, découvre comment l’énergie devient exécution terrain, vérifie les preuves, lève les objections, voit les ailes se créer, puis choisit s’il veut confier une paire d’ailes à Eddy.

⸻

Objectif final

À la fin, le recruteur doit se dire :

“Ce candidat n’a peut-être pas le parcours le plus classique, mais il a compris la marque, il comprend le terrain, il sait raconter, il sait structurer, il sait manager, il sait se vendre intelligemment, et il mérite au moins une conversation.”

C’est exactement le but du site.