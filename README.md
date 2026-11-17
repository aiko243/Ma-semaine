# Daily Journal

Planner / to-do personnel (routines, to-do, budget, sport…), installé sur l'écran d'accueil.
En ligne : https://aiko243.github.io/Ma-semaine/

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Squelette de la page, charge les fichiers ci-dessous |
| `style.css` | Apparence (mode coloré et mode sobre) |
| `app.js` | Données, onglets, formulaires, rappels, sauvegarde par fichier |
| `sync.js` | Synchronisation Firebase (fusion entre appareils), sauvegardes quotidiennes sur le compte |
| `boot.js` | Démarrage |
| `sw.js` | Service worker : notifications, ouverture rapide et hors ligne |
| `tests/` | Tests automatiques (faux serveur Firebase + appareils simulés dans Chrome) |

Après une modification de `style.css` ou des `.js`, augmenter le `?v=` dans `index.html`.

## Synchronisation
- Un document par compte : `users/{uid}` ; sauvegardes : `users/{uid}/backups/{AAAA-MM-JJ}` (30 jours).
- Chaque appareil garde la dernière version commune (« base »). À l'envoi, si le serveur a changé,
  l'appli fusionne base / appareil / serveur élément par élément, dans une transaction.
- Règles Firestore attendues :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Tests
```
pip install playwright && python -m playwright install chromium
python tests/run_tests.py          # tout
python tests/run_tests.py sync     # un groupe
```
Ils tournent aussi automatiquement sur GitHub à chaque modification (onglet Actions).
