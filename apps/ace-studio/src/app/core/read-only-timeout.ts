/**
 * @module read-only-timeout
 * @remarks Bound status requests that must not stall the UI or polling cycle.
 * @public
 */
import { MonoTypeOperatorFunction, throwError, timeout } from "rxjs";

/** @public Maximum wait for one non-mutating backend status request. */
export const READ_ONLY_TIMEOUT_MS = 15_000;

/**
 * @public Fail a non-mutating status request with a safe retryable timeout.
 * @remarks Unsubscribing from an HTTP request never cancels queued GPU inference.
 * Do not apply this operator to model initialization, job submission or training.
 * @param operation Trusted, static operation label suitable for user diagnostics.
 * @param delayMs Timeout in milliseconds; override only for deterministic tests.
 * @returns A standard RxJS operator preserving successful response values.
 * @throws Error if the status response does not arrive before the deadline.
 */
export function readOnlyTimeout<T>(
  operation: string, delayMs = READ_ONLY_TIMEOUT_MS
): MonoTypeOperatorFunction<T> {
  return timeout({
    first: delayMs,
    with: () => throwError(() => new Error(
      operation + " timed out. The ACE-Step job was not cancelled; retry is safe."
    ))
  });
}
