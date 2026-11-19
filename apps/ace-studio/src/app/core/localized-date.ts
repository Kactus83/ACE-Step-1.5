/**
 * @module localized-date
 * @remarks Local, browser/Tauri-native calendar display independent of Angular locale injection.
 * @public
 */
import { StudioLocale } from "./locale.store";

/**
 * @public Format a trusted millisecond timestamp in the user's active UI language.
 * @returns An em dash for invalid dates instead of throwing within Angular templates.
 * @remarks Uses the device timezone; the backend does not assign a display timezone.
 */
export function formatStudioDate(value: number, locale: StudioLocale): string {
  if (!Number.isFinite(value) || Math.abs(value) > 8_640_000_000_000_000) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium", timeStyle: "short"
  }).format(date);
}

