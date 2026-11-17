/**
 * @module connection-credential-tests
 * @remarks Credentials must never follow an edited endpoint implicitly.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { credentialAfterEndpointEdit } from "../../src/app/core/connection.store";

describe("endpoint-bound draft credentials", () => {
  it("preserves an unchanged address's token", () => {
    expect(credentialAfterEndpointEdit(
      "http://127.0.0.1:8001", "http://127.0.0.1:8001", "current-token"
    )).toBe("current-token");
  });

  it("clears a previous server's token before the new address can be saved", () => {
    expect(credentialAfterEndpointEdit(
      "http://127.0.0.1:8001", "https://new-server.example", "old-secret"
    )).toBe("");
    expect(credentialAfterEndpointEdit(
      "https://old-server.example", "https://new-server.example", "old-secret"
    )).toBe("");
  });

  it("clears the token during an incomplete URL edit too", () => {
    expect(credentialAfterEndpointEdit(
      "https://old-server.example", "https://old-server.exampl", "old-secret"
    )).toBe("");
  });
});
