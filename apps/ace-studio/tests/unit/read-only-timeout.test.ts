/**
 * @module read-only-timeout-tests
 * @remarks Status-read timeouts must fail boundedly without affecting other requests.
 * @internal
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { firstValueFrom, NEVER, of } from "rxjs";
import { readOnlyTimeout, READ_ONLY_TIMEOUT_MS } from "../../src/app/core/read-only-timeout";

afterEach(() => { vi.useRealTimers(); });

describe("bounded read-only request lifetimes", () => {
  it("keeps successful status response values untouched", async () => {
    expect(await firstValueFrom(of({ status: "ok" }).pipe(
      readOnlyTimeout("Health check", 25)
    ))).toEqual({ status: "ok" });
    expect(READ_ONLY_TIMEOUT_MS).toBeGreaterThan(1000);
  });

  it("releases a request that never emits and explains that the GPU job remains active", async () => {
    vi.useFakeTimers();
    const pending = firstValueFrom(NEVER.pipe(readOnlyTimeout("Task lookup", 25)));
    const assertion = expect(pending).rejects.toThrow(
      "Task lookup timed out. The ACE-Step job was not cancelled"
    );
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });
});
