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
  "batch.previousAria": { en: "Previous variant", fr: "Variante précédente" },
  "batch.nextAria": { en: "Next variant", fr: "Variante suivante" },
  "compare.errorSame": { en: "Choose two different audio files for comparison.", fr: "Choisissez deux fichiers audio différents pour les comparer." },
  "compare.errorLoad": { en: "Cannot load comparison audio.", fr: "Impossible de charger les pistes à comparer." },
  "compare.errorPlayback": { en: "Playback was blocked or the audio file has expired.", fr: "La lecture est bloquée ou le fichier audio a expiré." },
  "compare.errorSync": { en: "Synchronized audition is unavailable for these tracks.", fr: "La lecture simultanée est indisponible pour ces pistes." },
  "library.title": { en: "Organize your creations.", fr: "Organisez vos créations." },
  "library.lead": { en: "Keep intentional bookmarks of your finished tracks and their creative metadata.", fr: "Conservez volontairement vos morceaux terminés et leurs métadonnées créatives." },
  "library.export": { en: "Export projects JSON", fr: "Exporter les projets en JSON" },
  "library.backupNotice": { en: "This catalog is stored only in this browser or Tauri profile. It saves metadata and server references, not the audio files. Audio may disappear when the Python server cleans up outputs. Download important tracks separately.", fr: "Ce catalogue est stocké uniquement dans ce navigateur ou profil Tauri. Il contient des métadonnées et des références serveur, pas les fichiers audio. Ceux-ci peuvent disparaître lorsque Python nettoie les résultats. Téléchargez séparément les pistes importantes." },
  "library.corruptTitle": { en: "The stored project catalog is unreadable.", fr: "Le catalogue de projets enregistré est illisible." },
  "library.corruptWarning": { en: "No stored data has been overwritten. Download a raw backup before deciding whether to discard the damaged catalog. The raw backup can contain creative descriptions, lyrics and annotations.", fr: "Aucune donnée enregistrée n’a été écrasée. Téléchargez une sauvegarde brute avant de supprimer le catalogue endommagé. Cette sauvegarde peut contenir des descriptions, des paroles et des annotations." },
  "library.backup": { en: "Back up unreadable catalog", fr: "Sauvegarder le catalogue illisible" },
  "library.resetReview": { en: "Review corrupt catalog reset", fr: "Examiner la réinitialisation du catalogue endommagé" },
  "library.resetConfirm": { en: "Confirm discard corrupt catalog", fr: "Confirmer la suppression du catalogue endommagé" },
  "library.resetDetail": { en: "The reset deletes only the unreadable metadata catalog on this device, never audio files or the Python server dataset. A catalog that has become valid cannot be deleted by this recovery action.", fr: "La réinitialisation supprime uniquement les métadonnées illisibles de cet appareil, jamais les fichiers audio ni le dataset Python. Cette action ne peut pas supprimer un catalogue redevenu valide." },
  "library.collections": { en: "Your collections", fr: "Vos collections" },
  "library.searchLabel": { en: "Search projects and track tags", fr: "Rechercher des projets et tags" },
  "library.searchPlaceholder": { en: "Search…", fr: "Rechercher…" },
  "library.projectsAria": { en: "Local projects", fr: "Projets locaux" },
  "library.references": { en: "saved references", fr: "références enregistrées" },
  "library.noMatches": { en: "No projects match your search.", fr: "Aucun projet ne correspond à votre recherche." },
  "library.newProject": { en: "New project", fr: "Nouveau projet" },
  "library.newPlaceholder": { en: "Name your new project", fr: "Nommez votre nouveau projet" },
  "library.create": { en: "Create local project", fr: "Créer un projet local" },
  "library.importLabel": { en: "Import project metadata", fr: "Importer des métadonnées de projets" },
  "library.importNotice": { en: "Additive JSON import only; existing local projects are not overwritten.", fr: "L’import JSON ajoute des projets sans écraser les projets locaux existants." },
  "library.selectTitle": { en: "Select a project to get started.", fr: "Sélectionnez un projet pour commencer." },
  "library.selectNote": { en: "Save references from Queue & results, or create a project here.", fr: "Enregistrez des références depuis File et résultats, ou créez un projet ici." },
  "library.importTooLarge": { en: "Choose an archive smaller than 1.5 MB.", fr: "Choisissez une archive de moins de 1,5 Mo." },
  "library.importFailed": { en: "Could not import JSON.", fr: "Impossible d’importer le fichier JSON." },
  "project.name": { en: "Project name", fr: "Nom du projet" },
  "project.description": { en: "Description", fr: "Description" },
  "project.save": { en: "Save project details", fr: "Enregistrer les détails du projet" },
  "project.cancel": { en: "Cancel", fr: "Annuler" },
  "project.noNotes": { en: "No project notes yet.", fr: "Aucune note pour ce projet." },
  "project.edit": { en: "Edit project details", fr: "Modifier les détails du projet" },
  "project.delete": { en: "Delete local project", fr: "Supprimer le projet local" },
  "project.deleteConfirm": { en: "Confirm permanent local project removal", fr: "Confirmer la suppression définitive du projet local" },
  "project.savedRefs": { en: "Saved track references", fr: "Références de pistes enregistrées" },
  "project.filter": { en: "Filter titles, tags and notes", fr: "Filtrer titres, tags et notes" },
  "project.filterPlaceholder": { en: "Filter this project…", fr: "Filtrer ce projet…" },
  "project.noRefs": { en: "No matching references. Save a track from Queue & results.", fr: "Aucune référence correspondante. Enregistrez une piste depuis File et résultats." },
  "track.variant": { en: "Variant", fr: "Variante" },
  "track.favoriteAdd": { en: "Add favorite", fr: "Ajouter aux favoris" },
  "track.favoriteRemove": { en: "Remove favorite", fr: "Retirer des favoris" },
  "track.favoriteSaved": { en: "★ Saved favorite", fr: "★ Dans les favoris" },
  "track.favoriteMark": { en: "☆ Mark favorite", fr: "☆ Ajouter aux favoris" },
  "track.seed": { en: "Seed:", fr: "Graine :" },
  "track.otherBackendStart": { en: "This reference belongs to", fr: "Cette référence appartient à" },
  "track.otherBackendEnd": { en: "Connect to that backend to preview, download or remix. The original audio may already have expired.", fr: "Connectez-vous à ce serveur pour écouter, télécharger ou remixer. L’audio d’origine peut avoir expiré." },
  "track.notes": { en: "Track notes", fr: "Notes de piste" },
  "track.tags": { en: "Comma-separated tags", fr: "Tags séparés par des virgules" },
  "track.favorite": { en: "Favorite", fr: "Favori" },
  "track.save": { en: "Save track details", fr: "Enregistrer les détails de la piste" },
  "track.cancel": { en: "Cancel", fr: "Annuler" },
  "track.edit": { en: "Edit track tags & notes", fr: "Modifier les tags et les notes" },
  "track.remove": { en: "Remove reference", fr: "Retirer la référence" },
  "track.removeConfirm": { en: "Confirm remove reference", fr: "Confirmer le retrait de la référence" },
  "librarySave.label": { en: "Save reference to a local project", fr: "Enregistrer la référence dans un projet local" },
  "librarySave.choose": { en: "Choose project", fr: "Choisir un projet" },
  "librarySave.save": { en: "Save to project", fr: "Enregistrer dans le projet" },
  "librarySave.saved": { en: "Reference saved", fr: "Référence enregistrée" },
  "librarySave.empty": { en: "Create a project in Library to bookmark this track.", fr: "Créez un projet dans Bibliothèque pour enregistrer cette piste." },
  "jobs.phase.queued": { en: "queued", fr: "en attente" },
  "jobs.phase.running": { en: "running", fr: "en cours" },
  "jobs.phase.succeeded": { en: "succeeded", fr: "terminée" },
  "jobs.phase.failed": { en: "failed", fr: "échouée" },
  "jobs.phase.unknown": { en: "unknown", fr: "inconnu" },
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



