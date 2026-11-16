/**
 * @module locale-store
 * @remarks Typed, browser-local UI translation dictionaries with English fallback.
 * @public
 */
import { Injectable, signal } from "@angular/core";
import { RESULT_LOCALE_MESSAGES } from "./locale.results";
import { LIBRARY_LOCALE_MESSAGES } from "./locale.library";

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
  ...RESULT_LOCALE_MESSAGES,
  ...LIBRARY_LOCALE_MESSAGES
} as const satisfies Record<string, Record<StudioLocale, string>>;

/** @public Only keys whose language coverage is checked at build time. */
export type LocaleKey = keyof typeof MESSAGES;

/**
 * @public Resolve a strongly typed translation without Angular dependency injection.
 * @remarks Useful for pure tests and non-component consumers; never translates server data.
 */
export function translateLocale(key: LocaleKey, locale: StudioLocale): string {
  return MESSAGES[key][decodeLocale(locale)];
}

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
  text(key: LocaleKey): string { return translateLocale(key, this.mode()); }

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




