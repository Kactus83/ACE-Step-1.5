# MISSION — Équipe locale ACE Studio : qualification CI, déblocages et validation native

**Date de relais : 18 novembre 2026.**  
**Dépôt privé :** `Kactus83/ACE-Step-1.5`  
**Branche de travail :** `feature/ace-studio-angular-tauri`  
**PR :** https://github.com/Kactus83/ACE-Step-1.5/pull/2 (brouillon)  
**Dernier HEAD observé au début du relais :** `e71f4fd276349dbefdada2647c96be10dd9e9887`. **Ce SHA est un repère, jamais une cible figée.**  
**Dernier SHA bénéficiant d'une CI GitHub entièrement verte confirmée :** `34b2fd83feab714bb009d23712015882bf000204` (16 novembre 2026).

## 1. Mission et autonomie

Tu es l'équipe **locale** responsable de qualifier la version la plus récente d'ACE Studio, de résoudre les blocages démontrés par les compilations/tests et de rendre la PR techniquement promouvable **sans la fusionner**. Travaille directement sur la branche `feature/ace-studio-angular-tauri`. Tu as l'autorisation de modifier code/tests/docs, de committer et de pousser régulièrement des corrections ciblées. Les équipes GitHub peuvent pousser en parallèle : **aucun force-push, aucun reset destructif, aucune suppression de travaux concurrents, aucune promotion automatique vers `main` ou une autre branche**. Conserve la PR #2 ouverte en brouillon.

La mission couvre l'ensemble Angular 21, Tauri 2, TypeScript, Rust, contrats FastAPI/Python et expériences Windows locales. **Le moteur ACE-Step existant, Gradio, CLI, inférence et entraînement ne doivent pas être refondus**, sauf correction additive strictement nécessaire, documentée et testée.

## 2. Récupération du contexte (obligatoire)

1. Inspecte `git status --short --branch`, `git remote -v`, `git branch -vv`, `git log --oneline -n 20` et `git fetch origin`. Préserve toutes les modifications locales non committées. Identifie le vrai HEAD de `origin/feature/ace-studio-angular-tauri` et la branche locale. Si divergence : examine et réconcilie, jamais de `reset --hard` ni de force-push.
2. Lis intégralement `AGENTS.md`, `apps/ace-studio/AGENTS.md`, `apps/ace-studio/README.md`, puis `apps/ace-studio/docs/architecture.md`, `contracts.md`, `security-review.md`, `functional-coverage.md`, `verification.md`, `handoff.md`, `continuation.md`, `source-checkpoint-9.md`, `source-checkpoint-10.md` et `source-checkpoint-11.md`, ainsi que tout checkpoint plus récent disponible.
3. Vérifie la PR #2, les derniers commits d'autres équipes et `.github/workflows/ace-studio.yml`. **Ne considère pas l'absence de GitHub Actions comme un test réussi ou échoué.**
4. Crée un relevé initial avec SHA exact, date, machine, OS, versions Node/npm, Python/uv, Rust/Cargo, WebView2 et présence des prérequis Tauri. Ne publie aucun jeton, chemin personnel sensible, prompt privé, média ni fichier de modèles.

## 3. Séquence de qualification — exécuter, corriger, réexécuter

**Phase A — Qualité frontend à moindre coût.** Depuis `apps/ace-studio`, dans un environnement propre et reproductible, exécute :

```bash
node --version
npm --version
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run e2e:mock
```

Conserve la commande, son code de sortie, le nombre de tests et ses erreurs. Lance d'abord les tests ciblés après une correction, puis la suite entière. `npm ci` est la référence ; ne modifie pas les lockfiles arbitrairement. Contrôle le build Angular de production, pas uniquement le serveur de développement.

**Phase B — Contrats Python.** Depuis la racine du dépôt, dans l'environnement Python 3.11–3.12 compatible existant, exécute :

```bash
python -m unittest \
  acestep.api.http.query_result_route_test \
  acestep.api.http.studio_job_lookup_route_test \
  acestep.api.http.release_task_request_builder_test \
  acestep.api.http.studio_adapter_export_test \
  acestep.api.http.studio_cors_test
```

Utilise `uv run python` si c'est le mode normal et déjà provisionné. Si la commande échoue avant les tests sur des dépendances manquantes, **signale distinctement le problème d'environnement** ; n'entame pas automatiquement un téléchargement massif de modèles ni une réinstallation GPU. Examine ensuite les tests Python additionnels/legacy sans lancer inconsidérément une suite susceptible d'entraîner ou télécharger sur le matériel réel.

**Phase C — Rust/Tauri et artefacts Windows.**

```bash
cd apps/ace-studio/src-tauri
cargo test --locked
cargo check --locked
cd ..
npm run desktop:build
```

Sur Windows, vérifie la présence effective des MSI/NSIS, le chargement du WebView2, l'ouverture/fermeture du programme, le rendu et la navigation clavier. Tester une installation/remplacement système réel uniquement sur environnement isolé ou après validation de l'utilisateur. Un packaging non signé ne vaut pas qualification d'installateur signé ; consigne cet écart.

**Phase D — Tests navigateur et sécurité en régression.** Accorde une attention prioritaire à :

- `connection-credential-isolation.spec.ts` : un token du serveur A ne va jamais au serveur B ;
- `create-source-revision.spec.ts` : l'ancien audio ne déclenche pas un calcul sur le nouveau serveur ;
- `submission-backend-switch.spec.ts` : une ancienne soumission HTTP en attente ne bloque pas le nouveau serveur, et sa réponse tardive ne déverrouille ni ne pollue la nouvelle soumission ;
- `polling-fail-closed.spec.ts` et `auth-recovery.spec.ts` : 404/409/401/403 arrêtent le polling, 429/5xx restent retryables, reconnexion explicite ;
- `dataset-server-switch.spec.ts` et `dataset-conflict.spec.ts` : aucun PUT vers B après prélecture sur A, collision de métadonnées ;
- `existing-job-attachment.spec.ts` : retrouver un ID via GET sans `/release_task`, refuser absence/doublon/changement de serveur ;
- `job-model-filter.spec.ts`, `model-fallback-guard.spec.ts`, `reported-model-mismatch.spec.ts` : modèles chargés versus simplement disponibles, modes autorisés, réel DiT reporté, absence de génération supplémentaire ;
- `result-localization.spec.ts` et les tests du workflow d'analyse : EN/FR sans altérer les données serveur.

Les fixtures sont des **mocks** ; leurs pistes audio ne prouvent ni la qualité de génération ni la compatibilité codec réelle. Corrige les sélecteurs fragiles et attentes asynchrones à partir des logs, captures et traces, sans masquer une erreur par un `waitForTimeout` systématique.

## 4. Acceptation native, API et GPU (contrôlée)

Effectue d'abord les opérations **strictement read-only** : connexion, authentification, inventaire DiT/LM, état de file, sélection d'un serveur de test, métadonnées, analyse des réponses, navigation, lecture si un fichier de test jetable existe déjà. Valide les différentes origines `http://127.0.0.1`, `http://localhost` et les origines natives Tauri réellement utilisées. Teste CSP et CORS, dont `PUT` dataset, sans élargir les permissions de façon générale.

Avant **toute** génération GPU réelle, chargement/téléchargement de modèle, entraînement LoRA/LoKr, suppression/remplacement de dataset, export d'adaptateur, nettoyage d'un répertoire utilisateur ou réinitialisation coûteuse : demande à l'utilisateur une autorisation **explicite et ponctuelle** en décrivant l'action, son coût/impact et le chemin de sortie. Ne déclenche jamais ces opérations en boucle pour "tester". Favorise les jobs déjà présents et les fixtures jetables. Si une action peut être effectuée par l'utilisateur plus économiquement (ou nécessite une interaction machine), demande-lui de l'exécuter, puis observe le résultat.

Pour une validation GPU autorisée, fais au minimum : DiT réellement choisi vs DiT effectivement reporté, `/release_task` exactement une fois, ID conservé, file/statuts authentiques, audio lisible/téléchargeable, source Cover/Repaint si disponible, puis tests facultatifs de LM/analysis/training selon budget. Une réponse HTTP perdue **n'autorise jamais** une répétition automatique de la génération. L'API `GET /v1/studio/jobs/{id}` n'assure pas la récupération d'un job dont l'ID est perdu.

N'utilise **jamais** le legacy `POST /v1/training/export` pour des données réelles : son comportement peut être destructif. Le Studio utilise `/v1/studio/training/export`, autorisé uniquement sur racines explicitement configurées et destinataires jetables, sans écrasement.

## 5. Politique de correction, branches et push

- Un bug = cause démontrée, correctif minimal et test de non-régression pertinent. Conserve TSDoc, contrats typés, séparation des responsabilités et la politique modules cible 150 lignes / plafond 200 sauf justification documentée.
- Avant tout commit/push, récupère la référence distante, vérifie les modifications concurrentes et fais un rebase/reconcile **non destructif** si nécessaire. Pas de merge sauvage, pas de `git push --force`, pas de `git reset --hard`. Ne réécris pas les commits d'une autre équipe.
- Commit et `git push` après chaque bloc cohérent, puis note le SHA et les tests effectivement passés. Ne laisse pas un long lot de changements seulement en local. Évite les refactors de surface et les changements d'environnement qui rendraient la reproduction impossible.
- Évite de lancer des GitHub Actions payantes pour "faire passer la CI". La qualification locale est prioritaire. Si un déclenchement manuel `workflow_dispatch` paraît utile, sollicite l'accord de l'utilisateur sur la consommation de minutes/actions et l'absence de concurrence avec d'autres équipes.
- Maintiens la PR #2 en brouillon et à jour. Ne fusionne pas vers `main`, ne modifie pas PR #1, ne crée pas de release.

## 6. Rapport et Definition of Done

Produis `apps/ace-studio/docs/local-qualification-2026-11-18.md` (ou un nouveau fichier daté si nécessaire), comprenant :

1. HEAD testé, SHA après chaque correction, environnement exact, logs/résumés reproductibles ;
2. tableau **commande → statut PASS/FAIL/SKIP → nombre de tests → justification**, avec lien vers preuve réelle ;
3. liste priorisée P0/P1/P2, cause racine, fichiers corrigés, scénarios et non-régressions ;
4. inventaire API/DTO et authentification/CORS, résultats Chromium/WebView/Tauri/Windows, état du GPU (autorisé/testé ou non) ;
5. matrice fonctionnelle actualisée **implémenté / compilé / testé mock / testé API réelle / validé utilisateur** ;
6. risques restants (GPU multi-modèle, cache et provenance, sécurité des exports, audio et codecs, a11y, performance, autres OS, signature d'installation, absence de CAS serveur) ;
7. dernier SHA poussé, lien vers PR #2 et prochaines actions concrètes.

N'écris **jamais** "CI verte" à partir d'une simple revue de code : seuls un journal d'exécution ou un check-run exact du HEAD le permettent. Ne déclare pas l'application à 100 % tant que les critères d'acceptation natifs et utilisateurs ne sont pas satisfaits.

**Commence maintenant par l'audit d'état et la qualification sans GPU. Débloque les tests et corrige les défauts de manière autonome. N'interromps ton travail que pour les actes coûteux, destructifs, ambigus ou exigeant une autorisation humaine.**
