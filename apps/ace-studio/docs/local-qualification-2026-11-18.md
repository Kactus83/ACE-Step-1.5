# ACE Studio — qualification locale Windows

Qualification exécutée le **19 novembre 2026** sur la branche
`feature/ace-studio-angular-tauri`. Le nom de fichier conserve la date du
mandat de relais du 18 novembre.

## Périmètre et conclusion

- SHA source testé : `8ceb2ec0634bdc6d6a2144fcfbb9790ff1fb0dae`.
- SHA distant revérifié avant rédaction : identique au SHA testé.
- PR : <https://github.com/Kactus83/ACE-Step-1.5/pull/2>, ouverte en brouillon.
- Résultat local : frontend Angular, TypeScript, lint, Vitest, Chromium mock,
  contrats Python, Cargo et packaging Windows passent.
- API réelle : lecture seule et CORS vérifiés sur une instance locale déjà
  active. Aucun job, modèle, entraînement, export ou dataset réel n'a été lancé
  ou modifié.
- Acceptation restante : GPU/modèles réels, médias/codecs réels, raccourcis
  natifs, installation/upgrade des bundles, signature, accessibilité humaine et
  autres systèmes d'exploitation.

Cette exécution ne constitue ni une CI GitHub verte, ni une approbation de
release. Aucun workflow GitHub payant n'a été déclenché.

## Environnement

| Élément | Valeur observée |
| --- | --- |
| Machine | `DESKTOP-ENULTNV`, x64 |
| OS | Windows 11 Pro `10.0.26200`, build `26200`, 64 bits |
| Heure locale initiale | `2026-11-19T09:36:36+01:00` (Europe/Paris) |
| Node de référence | `24.22.3` (plage déclarée supportée) |
| npm | `11.17.0` |
| Python | `.venv`, CPython `3.12.16` |
| uv | `0.13.8` |
| Rust / Cargo | `1.93.0` / `1.93.0` |
| WebView2 Runtime | `157.0.4341.60` (registre EdgeUpdate) |
| Chromium Playwright | installation vérifiée par `npx playwright install chromium` |

Le Node système est `26.5.0`, hors de la plage déclarée dans `package.json`.
Une première passe complète a néanmoins réussi avec lui. La preuve principale
ci-dessous utilise le Node `24.22.3` déjà installé, appelé directement avec
`npm-cli.js`; aucune installation système n'a été effectuée.

## Résultats reproductibles

Toutes les commandes frontend ont été lancées depuis `apps/ace-studio`. Les
commandes Python ont été lancées depuis la racine, et Cargo depuis
`apps/ace-studio/src-tauri`.

| Commande | Statut | Résultat |
| --- | --- | --- |
| `node --version` / `npm --version` | PASS | Node `24.22.3`, npm `11.17.0` pour la passe de référence |
| `npm ci` | PASS | 533 paquets installés depuis le lockfile ; 21 vulnérabilités modérées de développement signalées |
| `npm run typecheck` | PASS | build Angular development strict produit, 2,02 MB brut |
| `npm run lint` | PASS | ESLint, aucun diagnostic |
| `npm run test` | PASS | Vitest : **41 fichiers, 149 tests** |
| `npm run build` | PASS | Angular production : 518,10 kB brut, 122,57 kB estimé transféré |
| `npx playwright install chromium` | PASS | Chromium disponible, aucune sortie d'erreur |
| `npm run e2e:mock` | PASS | Playwright : **51/51** scénarios, 1 worker, environ 1,9 min |
| cinq contrats Python imposés | PASS | **25 tests**, 24 passés, 1 skip Windows/symlink |
| découverte `acestep/api/http/*_test.py` | PASS | **110 tests**, 109 passés, 1 skip ; imports Torch sans calcul GPU |
| `cargo test --locked` | PASS | 0 test Rust, 0 échec, doc-tests inclus |
| `cargo check --locked` | PASS | profil dev terminé |
| `npm run desktop:build` (premier essai) | FAIL expliqué | ancienne instance `ace-studio-desktop.exe` ouverte depuis le 18 novembre, fichier release verrouillé (`os error 5`) |
| `npm run desktop:build` (après fermeture propre) | PASS | release x64, MSI et NSIS produits |
| `npm audit --omit=dev` | PASS | **0 vulnérabilité de production** |

La suite Playwright passée contient notamment les régressions demandées :
isolation de credentials, changement de serveur pendant lecture audio,
prélecture dataset et soumission, 404/409 fail-closed, récupération après auth,
rattachement de job sans `/release_task`, filtrage et politique de modèle,
provenance DiT, localisation EN/FR et absence de double soumission.

## Artefacts Windows

| Artefact | Taille | SHA-256 | Signature |
| --- | ---: | --- | --- |
| `ace-studio-desktop.exe` | 8 861 184 octets | `A846CAA5480D653BBB8FDBF8B5CE33521477B31B4DCAFF22ED8C6A0C0D19B78C` | non signé |
| `ACE Studio_0.1.0_x64_en-US.msi` | 2 973 696 octets | `920667383F9049223E5FC2862A90326A56F3B6F3DD66BB454C727B5EF8E95807` | non signé |
| `ACE Studio_0.1.0_x64-setup.exe` | 1 997 117 octets | `C61187D885F9B659241233601B2E73BF7D802DDECF531E69C4ABC15990C36054` | non signé |

L'exécutable release a été lancé dans le WebView2 réel. Le rendu sombre et la
CSP chargent correctement. Les vues Create, Analyze, Queue & results et
Connection ont été ouvertes, puis l'application a été fermée proprement. Le
raccourci injecté `Alt+2` n'a pas changé de vue dans cette automation native :
la navigation clavier reste donc à confirmer manuellement, même si les tests
Playwright correspondants passent. Les installateurs n'ont pas été exécutés.

## API réelle et CORS

Une instance préexistante sur `http://127.0.0.1:8001` a été interrogée en
lecture seule :

- `GET /health` : 200, API 1.0, DiT prêt, LM non initialisé ;
- `GET /v1/model_inventory` : 200, `acestep-v15-turbo` chargé, modes
  `text2music`, `repaint`, `cover`, `cover-nofsq` ; deux LM disponibles mais
  non chargés ;
- `GET /v1/stats` : 200, 0 job en file/en cours/réussi/échoué ;
- `GET /v1/studio/jobs/not-a-valid-id` : 404, aucun rattachement ni mutation.

Préflight réel `OPTIONS /v1/dataset/sample/0`, méthode demandée `PUT` et
headers `Authorization, Content-Type` :

| Origine | Résultat |
| --- | --- |
| `http://127.0.0.1:4200` | 200, origine reflétée, `GET, POST, PUT, OPTIONS` |
| `http://localhost:4200` | 200, origine reflétée, `GET, POST, PUT, OPTIONS` |
| `http://tauri.localhost` | 200, origine native reflétée |
| `https://tauri.localhost` | 400, refusée |
| `https://example.invalid` | 400, refusée |

Le profil local n'exigeait pas de bearer token. Les 401/403 et l'isolation de
credentials sont donc validés par contrats unitaires et mocks, pas contre un
serveur réel protégé. Aucun `PUT`, `POST /release_task`, initialisation,
chargement de modèle ou export n'a été envoyé.

## Défauts et corrections

### P0

Aucun défaut P0 source démontré pendant cette qualification.

### P1

- Le premier packaging était bloqué par une ancienne instance release tenant
  l'exécutable ouvert. Cause confirmée par le PID et le chemin exact ; fermeture
  normale, puis rebuild réussi. Aucun correctif source requis.
- Les raccourcis natifs Alt+chiffre ne sont pas confirmés par l'automation
  Windows, bien que les scénarios Chromium passent. Acceptation manuelle requise.

### P2

- 21 vulnérabilités modérées restent dans le tooling de développement ;
  `npm audit --omit=dev` retourne zéro vulnérabilité de production. Aucun
  `npm audit fix --force` incompatible n'a été appliqué.
- Les bundles sont non signés et l'installation/remplacement système n'a pas
  été testé.

## Matrice d'acceptation

| Domaine | Implémenté | Compilé | Tests automatisés | API réelle | Validation utilisateur |
| --- | --- | --- | --- | --- | --- |
| Angular/TypeScript/UI | oui | oui | 149 Vitest + 51 Chromium mocks | lecture seule | partielle, WebView inspecté |
| Connexion/inventaire/stats | oui | oui | oui | oui, sans auth | reste serveur protégé |
| Soumission/polling/concurrence | oui | oui | mocks ciblés passés | lecture seulement | GPU/job réel requis |
| Résultats/audio/codecs | oui | oui | mocks passés | aucun média réel disponible | requis |
| Dataset | oui | oui | conflits/CORS mocks passés | préflight PUT seulement | mutation jetable requise |
| Rattachement de job | oui | oui | Python + Vitest + E2E | 404 read-only seulement | ID réel requis |
| Modèles/provenance DiT | oui | oui | politique/mismatch passés | inventaire réel lu | routage multi-modèle GPU requis |
| Export sécurisé | oui | oui | contrats temp/symlink passés | non exécuté | destination jetable autorisée requise |
| LoRA/LoKr | partiel | oui | mocks passés | non exécuté | GPU requis |
| Tauri/Windows | oui | oui | Cargo + packaging | WebView connecté | clavier, médias, installation/signature requis |

## Risques et limites restants

- routage GPU multi-modèle, cache et provenance sur un job réel ;
- accusé de soumission perdu sans idempotency key ni découverte de job ;
- dataset serveur global sans CAS atomique ;
- lecture/téléchargement des codecs et médias réels dans WebView2 ;
- export réel uniquement vers des racines jetables explicitement autorisées ;
- écran 320 px, zoom 200 %, contraste, lecteur d'écran et navigation clavier
  manuelle ;
- installation, upgrade/désinstallation et signature MSI/NSIS ;
- packaging macOS/Linux et comportement sur d'autres WebViews.

## Prochaines actions contrôlées

1. Avec autorisation ponctuelle, lancer un unique job GPU jetable et vérifier
   DiT demandé/reporté, `/release_task` unique, ID, polling et média réel.
2. Tester un serveur réel protégé pour 401/403 et rattacher un ID existant sans
   nouvelle soumission.
3. Avec racines temporaires explicitement configurées, vérifier un export
   Studio non-écrasant ; ne jamais appeler la route legacy destructive.
4. Faire l'acceptation humaine clavier/a11y/audio puis l'installation isolée
   des bundles signés lorsqu'ils seront disponibles.
