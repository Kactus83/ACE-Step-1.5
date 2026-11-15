/**
 * @module desktop-build-config-tests
 * @remarks Keep Angular production assets compatible with the strict Tauri CSP.
 * @internal
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("desktop production build configuration", () => {
  it("loads styles without a CSP-blocked inline onload handler", () => {
    const workspace = JSON.parse(readFileSync(
      new URL("../../angular.json", import.meta.url), "utf8"
    )) as {
      projects: { "ace-studio": { architect: { build: { configurations: {
        production: { optimization: { styles: { inlineCritical: boolean } } }
      } } } } } };

    expect(workspace.projects["ace-studio"].architect.build.configurations
      .production.optimization.styles.inlineCritical).toBe(false);
  });
});
