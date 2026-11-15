/**
 * @module app-config
 * @remarks Configure all shared providers without coupling Angular to Tauri.
 * @public
 */
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";

/** @public Application providers shared by both deployment modes. */
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(withFetch())]
};
