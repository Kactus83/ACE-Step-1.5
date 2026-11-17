/**
 * @module connection-revision-tests
 * @remarks A session identity change invalidates deferred source operations.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { ConnectionStore } from "../../src/app/core/connection.store";

describe("session backend revision boundaries", () => {
  it("changes revision when the token changes but not on an identical value", () => {
    const connection = new ConnectionStore();
    const before = connection.revision();
    connection.setApiKey("token-A");
    expect(connection.revision()).toBeGreaterThan(before);
    const after = connection.revision();
    connection.setApiKey("token-A");
    expect(connection.revision()).toBe(after);
  });

  it("clears an existing API token and changes revision on endpoint switch", () => {
    const connection = new ConnectionStore();
    connection.setApiKey("token-for-old-server");
    const revision = connection.revision();
    connection.setEndpoint("https://different.example");
    expect(connection.revision()).toBeGreaterThan(revision);
    expect(connection.apiKey()).toBe("");
  });
});
