/**
 * @module bootstrap
 * @remarks Browser and Tauri webview share this exact Angular bootstrap.
 * @internal
 */
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : "Unknown startup error";
  const outlet = document.querySelector("ace-root");
  if (outlet) outlet.textContent = "ACE Studio could not start: " + reason;
});
