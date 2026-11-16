/**
 * @module locale-store
 * @remarks Typed, browser-local UI translation dictionaries with English fallback.
 * @public
 */
import { Injectable, signal } from "@angular/core";

/** @public Explicitly supported interface languages. */
export type StudioLocale = "en" | "fr";

const MESSAGES = {
  "nav.create": { en: "Create", fr: "Créer" },
  "nav.analysis": { en: "Analyze", fr: "Analyser" },
  "nav.jobs": { en: "Queue & results", fr: "File et résultats" },
  "nav.library": { en: "Library", fr: "Bibliothèque" },
  "nav.datasets": { en: "Datasets", fr: "Jeux de données" },
  "nav.training": { en: "Training", fr: "Entraînement" },
  "nav.system": { en: "Connection", fr: "Connexion" },
  "nav.shortcuts": { en: "Shortcuts ?", fr: "Raccourcis ?" },
  "nav.shortcutsHelp": { en: "Keyboard shortcuts", fr: "Raccourcis clavier" },
  "nav.close": { en: "Close", fr: "Fermer" },
  "nav.shortcutHint": {
    en: "Available outside text inputs and dropdowns.",
    fr: "Disponibles hors des champs de saisie et listes déroulantes."
  },
  "nav.showHelp": { en: "Toggle help", fr: "Afficher/masquer l’aide" },
  "nav.closeHelp": { en: "Close help", fr: "Fermer l’aide" },
  "nav.skip": { en: "Skip to workspace", fr: "Accéder directement au contenu" },
  "nav.refresh": { en: "Refresh status", fr: "Actualiser le statut" },
  "nav.online": { en: "API online", fr: "API en ligne" },
  "nav.offline": { en: "API offline", fr: "API hors ligne" },
  "nav.connected": { en: "Engine connected", fr: "Moteur connecté" },
  "nav.disconnected": { en: "Engine disconnected", fr: "Moteur déconnecté" },
  "nav.noModel": { en: "No model selected", fr: "Aucun modèle sélectionné" },
  "nav.themeLight": { en: "Light", fr: "Clair" },
  "nav.themeDark": { en: "Dark", fr: "Sombre" },
  "nav.language": { en: "Interface language", fr: "Langue de l’interface" },
  "analysis.title": { en: "Understand a recording.", fr: "Comprendre un enregistrement." },
  "analysis.lead": {
    en: "Inspect semantic audio codes or analyze musical metadata on your existing ACE-Step engine.",
    fr: "Inspectez les codes audio sémantiques ou analysez les métadonnées musicales avec votre moteur ACE-Step."
  },
  "analysis.operation": { en: "Analysis operation", fr: "Opération d’analyse" },
  "analysis.source": { en: "Source audio file", fr: "Fichier audio source" },
  "analysis.submit": { en: "Submit analysis", fr: "Lancer l’analyse" },
  "analysis.model": { en: "DiT model", fr: "Modèle DiT" },
  "analysis.metadata": { en: "Music description", fr: "Description musicale" },
  "analysis.lyrics": { en: "Lyrics or structural hints (optional)",
    fr: "Paroles ou indications de structure (facultatif)" },
  "analysis.codes": { en: "Extract audio codes from a recording",
    fr: "Extraire les codes audio d’un enregistrement" },
  "analysis.deep": { en: "Deep analysis of a recording with 5Hz LM",
    fr: "Analyse approfondie d’un enregistrement avec le LM 5 Hz" },
  "analysis.text": { en: "Analyze a description / lyrics with 5Hz LM",
    fr: "Analyser une description ou des paroles avec le LM 5 Hz" }
  "jobs.title": { en: "Queue & results.", fr: "File et résultats." },
  "jobs.lead": { en: "Follow actual server jobs, listen to finished tracks, and reuse audio for new ideas.", fr: "Suivez les tâches du serveur, écoutez vos créations et réutilisez les résultats." },
  "jobs.refresh": { en: "Check jobs now", fr: "Vérifier les tâches" },
  "jobs.connection": { en: "Connection interrupted:", fr: "Connexion interrompue :" },
  "jobs.retry": { en: "Pending jobs will be checked again automatically.", fr: "Les tâches en attente seront vérifiées automatiquement." },
  "jobs.blocked": { en: "Automatic checks are paused until you reconnect with valid credentials.", fr: "Les vérifications automatiques sont suspendues jusqu’à une reconnexion autorisée." },
  "jobs.compare": { en: "Compare finished tracks A/B", fr: "Comparer les morceaux A/B" },
  "jobs.status": { en: "Status", fr: "État" },
  "jobs.all": { en: "All jobs", fr: "Toutes les tâches" },
  "jobs.active": { en: "Active", fr: "En cours" },
  "jobs.succeeded": { en: "Succeeded", fr: "Terminées" },
  "jobs.failed": { en: "Failed", fr: "Échouées" },
  "jobs.search": { en: "Search queue", fr: "Rechercher dans la file" },
  "jobs.placeholder": { en: "Title, task ID, prompt…", fr: "Titre, identifiant, description…" },
  "jobs.emptyTitle": { en: "Your next masterpiece begins in Create.", fr: "Votre prochaine création commence dans Créer." },
  "jobs.emptyLead": { en: "As soon as you submit a job, it appears here. Progress is always reported by ACE-Step.", fr: "Les tâches apparaissent ici dès leur envoi. Leur progression provient exclusivement d’ACE-Step." },
  "jobs.job": { en: "Generation job ", fr: "Tâche de génération " },
  "jobs.unit": { en: "jobs", fr: "tâches" },
  "jobs.reported": { en: "reported by ACE-Step.", fr: "communiqués par ACE-Step." },
  "jobs.progressAbsent": { en: "No numeric progress has been reported by ACE-Step.", fr: "ACE-Step n’a pas communiqué de progression chiffrée." },
  "jobs.waiting": { en: "Waiting for the backend…", fr: "En attente du serveur…" },
  "jobs.failure": { en: "Generation failed. Inspect backend diagnostics.", fr: "Génération échouée. Consultez les diagnostics du serveur." },
  "jobs.noAudio": { en: "Job completed without a playable audio file.", fr: "Tâche terminée sans fichier audio lisible." },
  "jobs.forget": { en: "Remove from this session", fr: "Retirer de cette session" },
  "jobs.forgetNote": { en: "Does not cancel inference on the backend", fr: "N’annule pas le calcul sur le serveur" },
  "jobs.noMatch": { en: "No jobs match this filter.", fr: "Aucune tâche ne correspond à ce filtre." },
  "jobs.numericAria": { en: "ACE-Step reported task progress", fr: "Progression communiquée par ACE-Step" },
  "jobs.indeterminateAria": { en: "Task progress not reported", fr: "Progression non communiquée" },
  "batch.count": { en: "generated variants", fr: "variantes générées" },
  "batch.all": { en: "All audio variants visible", fr: "Toutes les variantes audio sont visibles" },
  "batch.viewing": { en: "Viewing variant", fr: "Variante affichée" },
  "batch.of": { en: "of", fr: "sur" },
  "batch.previous": { en: "← Previous", fr: "← Précédente" },
  "batch.next": { en: "Next →", fr: "Suivante →" },
  "batch.showAll": { en: "Show all", fr: "Tout afficher" },
  "batch.navigation": { en: "Batch variant navigation", fr: "Navigation dans les variantes du lot" },
  "batch.choose": { en: "Choose individual variant", fr: "Choisir une variante" },
  "batch.show": { en: "Show variant", fr: "Afficher la variante" },
  "compare.title": { en: "Compare two variants", fr: "Comparer deux variantes" },
  "compare.description": { en: "Select completed queue results or local bookmarks from the current backend. Preview audio is downloaded through the authenticated API.", fr: "Sélectionnez des résultats terminés ou des favoris du serveur actuel. L’audio est téléchargé via l’API authentifiée." },
  "compare.needTwo": { en: "Generate or bookmark at least two different audio files to compare.", fr: "Générez ou enregistrez au moins deux fichiers audio différents pour les comparer." },
  "compare.trackA": { en: "Track A", fr: "Piste A" },
  "compare.trackB": { en: "Track B", fr: "Piste B" },
  "compare.selectA": { en: "Select first audio", fr: "Choisir le premier audio" },
  "compare.selectB": { en: "Select second audio", fr: "Choisir le second audio" },
  "compare.loading": { en: "Loading comparison…", fr: "Chargement de la comparaison…" },
  "compare.load": { en: "Load comparison audio", fr: "Charger les audios à comparer" },
  "compare.seed": { en: "Seed", fr: "Graine" },
  "compare.notReported": { en: "not reported", fr: "non communiquée" },
  "compare.listenA": { en: "Listen A only", fr: "Écouter A uniquement" },
  "compare.listenB": { en: "Listen B only", fr: "Écouter B uniquement" },
  "compare.start": { en: "Start both approximately together", fr: "Lancer les deux pistes approximativement ensemble" },
  "compare.pause": { en: "Pause both", fr: "Mettre les deux en pause" },
  "compare.warning": { en: "Browser and WebView audio clocks are not sample-synchronized. This is a listening comparison, not phase-accurate analysis.", fr: "Les horloges audio des navigateurs et WebView ne sont pas synchronisées à l’échantillon près. Cette comparaison est destinée à l’écoute, pas à une analyse de phase." },
} as const satisfies Record<string, Record<StudioLocale, string>>;

/** @public Only keys whose language coverage is checked at build time. */
export type LocaleKey = keyof typeof MESSAGES;

/** @public Reject unrecognized persisted values rather than injecting arbitrary UI strings. */
export function decodeLocale(value: unknown): StudioLocale {
  return value === "fr" ? "fr" : "en";
}

/** @public Runtime dictionary with persistent user preference and safe fallback. */
@Injectable({ providedIn: "root" })
export class LocaleStore {
  private static readonly storageKey = "ace-studio:locale:v1";
  readonly mode = signal<StudioLocale>("en");

  constructor() {
    try { this.mode.set(decodeLocale(localStorage.getItem(LocaleStore.storageKey))); }
    catch { /* Browser privacy restrictions keep English default. */ }
    this.apply();
  }

  private apply(): void {
    document.documentElement.lang = this.mode();
  }

  /** @public Translate one supported UI key from the compiled bilingual dictionary. */
  text(key: LocaleKey): string { return MESSAGES[key][this.mode()]; }

  /** @public Persist the explicit language preference, not any user content. */
  set(locale: StudioLocale): void {
    this.mode.set(decodeLocale(locale));
    this.apply();
    try { localStorage.setItem(LocaleStore.storageKey, this.mode()); }
    catch { /* Preference storage is optional. */ }
  }

  /** @public Toggle English/French without reloading or clearing workspace state. */
  toggle(): void { this.set(this.mode() === "en" ? "fr" : "en"); }
}

