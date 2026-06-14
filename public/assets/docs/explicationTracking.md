⸻

Objectif

Mettre en place un système interne de tracking pour le site de candidature Red Bull.

Le système doit permettre d’envoyer à chaque recruteur un lien unique tracké, de créer une session de consultation, de suivre les interactions importantes sur le site, puis d’afficher les résultats dans un petit dashboard admin.

Il doit aussi exister un lien non tracké pour les personnes qui ne souhaitent pas être suivies.

⸻

Principe général

Il y aura deux types de liens.

1. Lien tracké

Format recommandé :

https://portfolio-eddy.sallault-eddy.workers.dev/r/RB-7K2P9

ou :

https://portfolio-eddy.sallault-eddy.workers.dev/redbull?t=RB-7K2P9

Le token RB-7K2P9 est unique par destinataire.

Quand la personne ouvre ce lien :

* le site identifie le token ;
* crée ou reprend une session ;
* enregistre les événements ;
* mesure le temps actif ;
* suit les clics importants ;
* détecte les visites de retour.

2. Lien non tracké

Format recommandé :

https://portfolio-eddy.sallault-eddy.workers.dev/redbull?tracking=off

ou :

https://portfolio-eddy.sallault-eddy.workers.dev/public/redbull

Dans ce mode :

* aucun événement comportemental n’est enregistré ;
* pas de session analytics ;
* pas de heartbeat ;
* pas de document tracking ;
* uniquement éventuellement des logs serveur techniques minimaux Cloudflare, sans exploitation dans le dashboard.

⸻

Texte à mettre dans l’email

Tu peux mettre une phrase très claire, sans faire peur :

For transparency: the personalized link below lets me understand whether the candidate file is viewed and which sections are opened, so I can avoid unnecessary follow-ups and know whether the application was actually reviewed.
Personalized tracked link:
[Open Eddy’s Red Bull candidate file]
If you prefer not to have this visit analyzed, you can use the non-tracked version here:
[Open non-tracked version]

Ou version plus courte :

Transparency note: the personalized link includes basic engagement analytics, such as whether the file was opened, which sections were viewed, and which documents were clicked. If you prefer not to be included in this tracking, please use the non-tracked version below.

⸻

Données à suivre

Données autorisées / utiles

Pour chaque session :

token
session_id
visitor_id anonymous
first_seen_at
last_seen_at
active_time_seconds
visit_count
device_type
browser_family
os_family
country / region approximative si disponible
referrer
tracking_consent = true

Pour chaque événement :

page_view
section_view
scroll_depth
case_file_open
case_article_open
proof_validated
gap_file_open
gap_control_marked
document_click
document_download
linkedin_click
email_click
cta_click
share_link_generated
visitor_identified
visitor_anonymous
appointment_request
message_sent
no_fit_today
return_visit
heartbeat
exit

Données à éviter

À ne pas stocker :

IP complète
fingerprint agressif
canvas fingerprint
keystrokes
mouvements souris détaillés
enregistrement écran
données personnelles non nécessaires

Tu veux mesurer l’engagement, pas espionner la personne.

⸻

Architecture recommandée

Vu que ton site semble déjà sur Cloudflare Workers / Pages, je recommande :

Cloudflare Pages ou Worker pour le site
Cloudflare Worker pour API tracking
Cloudflare D1 pour base SQL
Cloudflare KV éventuellement pour cache/session rapide
Cloudflare R2 éventuellement pour documents PDF

⸻

Routes à créer

Public

GET /r/:token

Ouvre la version trackée du site.

Actions :

* vérifier que le token existe ;
* injecter dans le HTML une variable JS :

window.__TRACKING__ = {
  enabled: true,
  token: "RB-7K2P9"
}

* afficher le site normal.

⸻

GET /redbull?tracking=off

Ouvre la version non trackée.

Actions :

window.__TRACKING__ = {
  enabled: false,
  token: null
}

Aucun appel /api/track.

⸻

API tracking

POST /api/session/start

Crée une session.

Payload :

{
  "token": "RB-7K2P9",
  "page": "/redbull",
  "timezone": "America/Toronto",
  "screen": {
    "width": 1440,
    "height": 900
  }
}

Réponse :

{
  "sessionId": "sess_abc123",
  "visitorId": "vis_xyz789"
}

⸻

POST /api/track

Enregistre un événement.

Payload :

{
  "token": "RB-7K2P9",
  "sessionId": "sess_abc123",
  "eventType": "section_view",
  "sectionId": "candidate-scan",
  "eventData": {
    "sectionTitle": "Candidate Scan",
    "percentVisible": 75
  },
  "timestamp": "2026-06-13T18:30:00.000Z"
}

⸻

POST /api/heartbeat

Toutes les 10 ou 15 secondes si l’onglet est actif.

Payload :

{
  "token": "RB-7K2P9",
  "sessionId": "sess_abc123",
  "active": true,
  "currentSection": "evidence-files"
}

⸻

POST /api/share

Quand le recruteur clique sur :

Forward to the wing specialist

Le système crée un nouveau lien enfant.

Payload :

{
  "parentToken": "RB-7K2P9",
  "sessionId": "sess_abc123",
  "label": "Forwarded from Red Bull recruiter"
}

Réponse :

{
  "shareToken": "RB-SHARE-92KLM",
  "shareUrl": "https://portfolio-eddy.sallault-eddy.workers.dev/r/RB-SHARE-92KLM"
}

Important : ce lien enfant doit être relié au token parent.

⸻

GET /d/:documentId?t=:token

Lien de téléchargement tracké pour CV / Wingfinder / PDF.

Exemple :

/d/resume?t=RB-7K2P9
/d/wingfinder-report?t=RB-7K2P9
/d/wingfinder-passport?t=RB-7K2P9

Si tracking activé :

* enregistrer document_download ;
* rediriger vers le fichier réel.

Si tracking off :

* lien direct non tracké vers le fichier.

⸻

Admin

GET /admin

Dashboard protégé par login.

POST /admin

Crée un destinataire et un lien tracké personnalisé.

Champs :

{
  "first_name": "Alex",
  "last_name": "Recruiter",
  "email": "alex@redbull.com",
  "role": "Talent Acquisition",
  "company": "Red Bull"
}

Résultat :

* création / insertion dans contacts ;
* création d’un token unique dans links ;
* affichage d’un lien copiable :

https://portfolio-eddy.sallault-eddy.workers.dev/r/RB-7K2P9

Toutes les sessions ouvertes depuis ce lien sont rattachées à ce contact.
Si ce contact génère ensuite un lien de transfert, le lien enfant garde parent_token,
ce qui permet de voir dans l’admin de quel destinataire vient l’invitation.

Solution simple au départ :

* Basic Auth via Cloudflare Worker ;
* ou mot de passe admin dans variable d’environnement ;
* plus tard, vraie auth.

⸻

Base de données D1

Table contacts

CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  company TEXT,
  role TEXT,
  email TEXT,
  channel TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

⸻

Table links

CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  contact_id INTEGER,
  campaign TEXT,
  parent_token TEXT,
  tracking_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_opened_at TEXT,
  status TEXT DEFAULT 'created',
  FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

⸻

Table sessions

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  token TEXT NOT NULL,
  visitor_id TEXT,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT,
  active_time_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  referrer TEXT,
  user_agent_hash TEXT,
  tracking_consent INTEGER DEFAULT 1,
  FOREIGN KEY(token) REFERENCES links(token)
);

⸻

Table events

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  token TEXT,
  event_type TEXT NOT NULL,
  section_id TEXT,
  event_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES sessions(session_id)
);

⸻

Table documents

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT,
  file_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

⸻

Table messages

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT,
  type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  message TEXT,
  event_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

⸻

Événements précis à instrumenter dans le site

Page ouverte

Au chargement :

track("page_view", {
  path: location.pathname,
  title: document.title
});

⸻

Section vue

Utiliser IntersectionObserver.

Sections importantes :

hero
role-blueprint
candidate-scan
evidence-validation
proof-archive
red-flags-clearance
wing-fitting-room
standard-flight-file

Event :

track("section_view", {
  sectionId: "candidate-scan",
  sectionTitle: "Candidate Scan"
});

Ne pas envoyer 50 fois le même événement : une fois par section et par session suffit.

⸻

Scroll depth

Envoyer seulement par paliers :

25%
50%
75%
100%

Event :

track("scroll_depth", {
  depth: 50
});

⸻

Clic case file

track("case_file_open", {
  caseId: "case-03",
  caseTitle: "Train operators"
});

⸻

Article ouvert

track("case_article_open", {
  caseId: "case-03",
  articleTitle: "Turning new profiles into field operators"
});

⸻

Preuve validée

track("proof_validated", {
  proofId: "lead-coach-develop",
  requirement: "Lead, coach, and develop a highly capable team"
});

⸻

Gap file ouvert

track("gap_file_open", {
  gapId: "no-direct-retail-dsd",
  title: "No direct retail / DSD background?"
});

⸻

Gap control marked

track("gap_control_marked", {
  gapId: "no-direct-retail-dsd",
  status: "controlled"
});

⸻

CTA final

track("cta_click", {
  ctaId: "invite-fitting-room",
  label: "Invite me to the fitting room"
});

Autres CTA :

send-to-wing-specialist
keep-in-wing-room
email-direct
linkedin-profile

⸻

Script frontend à créer

Créer un fichier :

/src/tracking.js

Responsabilités :

* lire window.__TRACKING__;
* si enabled === false, ne rien faire ;
* créer une session ;
* gérer track();
* gérer heartbeat ;
* gérer section observer ;
* gérer scroll depth ;
* utiliser navigator.sendBeacon() au unload ;
* fallback fetch() si sendBeacon non disponible.

Pseudo-code :

const Tracking = {
  enabled: false,
  token: null,
  sessionId: null,
  visitorId: null,
  seenSections: new Set(),
  sentScrollDepths: new Set(),
  async init() {
    const config = window.__TRACKING__;
    if (!config || !config.enabled || !config.token) return;
    this.enabled = true;
    this.token = config.token;
    const session = await fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: this.token,
        page: location.pathname,
        referrer: document.referrer,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    }).then(r => r.json());
    this.sessionId = session.sessionId;
    this.visitorId = session.visitorId;
    this.track("page_view", {
      path: location.pathname,
      title: document.title
    });
    this.setupHeartbeat();
    this.setupSectionObserver();
    this.setupScrollDepth();
    this.setupUnload();
  },
  track(eventType, eventData = {}, sectionId = null) {
    if (!this.enabled || !this.sessionId) return;
    const payload = {
      token: this.token,
      sessionId: this.sessionId,
      eventType,
      sectionId,
      eventData,
      timestamp: new Date().toISOString()
    };
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  },
  setupHeartbeat() {
    setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: this.token,
          sessionId: this.sessionId,
          active: true,
          currentSection: this.currentSection || null
        }),
        keepalive: true
      }).catch(() => {});
    }, 15000);
  }
};
window.Tracking = Tracking;
document.addEventListener("DOMContentLoaded", () => Tracking.init());

⸻

Session active time

Dans /api/heartbeat, ajouter 15 secondes maximum par heartbeat valide.

Règle anti-fausse durée :

* si dernier heartbeat < 30 secondes : ajouter 15 secondes ;
* si écart trop long : ne pas compter tout l’écart ;
* si onglet caché : ne pas envoyer heartbeat ;
* si aucune interaction pendant longtemps : optionnellement arrêter.

⸻

Dashboard admin attendu

Vue liste contacts

Colonnes :

Contact
Company
Campaign
Token
Opened?
Visits
Active time
Sections viewed
Documents clicked
CTA clicked
Forward generated?
Last activity
Engagement score

Engagement score simple :

+10 page opened
+10 more than 60s active
+15 candidate scan viewed
+15 evidence validation completed
+10 gap review completed
+10 documents opened
+20 CTA clicked
+20 returned later
+20 share link generated

Afficher :

Cold
Opened
Interested
Highly engaged

⸻

Vue détail contact

Afficher une timeline :

09:42 — Opened candidate file
09:43 — Viewed Candidate Scan
09:44 — Validated proof file: Lead, coach, develop
09:46 — Opened gap file: No direct DSD background
09:48 — Downloaded resume
09:49 — Clicked: Send to wing specialist
14:12 — Returned visit

Afficher aussi :

Total active time
Number of visits
Top sections
Documents opened
Gaps controlled
Generated share links
Possible forwarded views

⸻

Détection “revenu plus tard”

Quand une nouvelle session arrive avec le même token :

* si ce n’est pas la première session ;
* et si l’écart est supérieur à 30 minutes ;

créer un événement :

return_visit

⸻

Détection “lien transmis”

Deux niveaux.

Confirmé

Si la personne clique sur le bouton :

Send to the wing specialist

et génère un nouveau lien :

share_link_generated

Alors c’est confirmé.

Possible

Si le même token est ouvert sur un nouveau device / navigateur / région très différente :

possible_forwarded_view

Mais afficher comme hypothèse, jamais comme certitude.

⸻

Fonction “Generate tracked link”

Dans l’admin :

Formulaire :

Name
Company
Role
Email
Campaign
Notes

Bouton :

Generate tracked link

Résultat :

Tracked link:
https://.../r/RB-7K2P9
Non-tracked link:
https://.../redbull?tracking=off

Option : bouton copier.

⸻

Gestion des documents

Dans le HTML, les liens documents doivent être générés selon le mode.

Si tracking actif :

<a href="/d/resume?t=RB-7K2P9">Resume</a>

Si tracking off :

<a href="/files/resume.pdf">Resume</a>

Documents :

resume
wingfinder-report
wingfinder-passport
case-studies

⸻

Privacy / consent à intégrer

Dans l’email

Tu l’as déjà prévu.

Dans le site tracké

En haut ou footer discret :

This personalized page uses basic engagement analytics because it was opened through a tracked link. A non-tracked version is available in the original email.

Dans le site non tracké

Footer :

You are viewing the non-tracked version of this candidate file.

⸻

Sécurité

À faire absolument :

* limiter CORS à ton domaine ;
* refuser les tokens inconnus ;
* ne pas exposer /admin sans authentification ;
* hasher user-agent si stocké ;
* ne pas stocker IP complète ;
* rate limit /api/track;
* ignorer les payloads trop gros ;
* valider eventType avec une whitelist ;
* nettoyer eventData.

Whitelist event types :

const allowedEvents = [
  "page_view",
  "section_view",
  "scroll_depth",
  "case_file_open",
  "case_article_open",
  "proof_validated",
  "gap_file_open",
  "gap_control_marked",
  "document_click",
  "document_download",
  "linkedin_click",
  "email_click",
  "cta_click",
  "share_link_generated",
  "visitor_identified",
  "visitor_anonymous",
  "appointment_request",
  "message_sent",
  "no_fit_today",
  "return_visit",
  "possible_forwarded_view",
  "exit"
];

⸻

Priorité de développement

Version 1 — indispensable

1. Token unique
2. Session start
3. Event tracking
4. Heartbeat
5. Document click
6. CTA click
7. Dashboard simple
8. Lien non tracké

Version 2

1. Share link generator
2. Parent / child tokens
3. Timeline détaillée
4. Engagement score
5. Possible forwarded view
6. Export CSV

Version 3

1. Email open pixel, optionnel, mais peu fiable
2. Comparaison campagnes
3. Notifications email quand un profil est ouvert
4. Replay synthétique de parcours, sans enregistrement écran

⸻

Instruction finale pour Codex

Construire le système comme un module séparé, propre et réutilisable :

/src/tracking/client.js
/src/tracking/server.js
/src/admin/dashboard.js
/migrations/001_tracking.sql

Le tracking doit être désactivable globalement via variable :

TRACKING_ENABLED=true

Le dashboard admin doit fonctionner même avec peu de données.

Le site ne doit jamais casser si l’API tracking échoue.
Si /api/track échoue, l’expérience recruteur continue normalement.

⸻
