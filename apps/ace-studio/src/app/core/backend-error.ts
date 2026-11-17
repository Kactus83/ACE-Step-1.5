/**
 * @module backend-error
 * @remarks Classify real HTTP/network failures without exposing tokens or raw URLs.
 * @public
 */

/** @public Stable error categories used to choose safe retry behavior. */
export type BackendErrorKind =
  "authorization" | "missing" | "conflict" | "rate-limit"
  | "network" | "unavailable" | "invalid" | "unknown";

/** @public User-safe result preserving retry semantics, not backend secrets. */
export interface BackendFailure {
  readonly kind: BackendErrorKind;
  readonly message: string;
  readonly retryable: boolean;
}

function statusOf(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const status = (value as { status?: unknown }).status;
  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

/**
 * @public Classify expected transport status codes for the standalone REST API.
 * @remarks 401/403 require a user action; automatic background loops must stop.
 */
export function classifyBackendFailure(value: unknown): BackendFailure {
  const status = statusOf(value);
  if (status === 401) return {
    kind: "authorization", retryable: false,
    message: "ACE-Step refused the API token (401). Review the token in Connection."
  };
  if (status === 403) return {
    kind: "authorization", retryable: false,
    message: "ACE-Step denied this operation (403). Check backend permissions."
  };
  if (status === 404) return {
    kind: "missing", retryable: false,
    message: "The requested ACE-Step resource or API route was not found (404)."
  };
  if (status === 409) return {
    kind: "conflict", retryable: false,
    message: "ACE-Step reported a conflict (409). Refresh server state before retrying."
  };
  if (status === 429) return {
    kind: "rate-limit", retryable: true,
    message: "ACE-Step is rate-limiting requests (429). Retrying will be delayed."
  };
  if (status === 0) return {
    kind: "network", retryable: true,
    message: "ACE-Step is unreachable. Verify the server, TLS, network and browser CORS."
  };
  if (status !== null && status >= 500) return {
    kind: "unavailable", retryable: true,
    message: "ACE-Step returned a server error (" + status + ")."
  };
  if (status !== null && status >= 400) return {
    kind: "invalid", retryable: false,
    message: "ACE-Step rejected the request (" + status + "). Review its parameters."
  };
  return {
    kind: "unknown", retryable: true,
    message: "ACE-Step request failed. Review connection and server diagnostics."
  };
}

/**
 * @public Extract a safe message without reflecting opaque backend exception data.
 * @remarks Known non-HTTP validation exceptions retain bounded user-facing text.
 */
export function safeBackendMessage(value: unknown): string {
  const status = statusOf(value);
  if (status !== null) return classifyBackendFailure(value).message;
  return value instanceof Error && value.message.length <= 400
    ? value.message : classifyBackendFailure(value).message;
}


/**
 * @public Warn that a lost submission acknowledgement might already represent GPU work.
 * @remarks Unlike status polling, retrying POST /release_task can enqueue a second job.
 * @param value Submission failure, including a possible network interruption.
 * @param notice Localized UI text explaining the ambiguous acceptance.
 * @returns Safe diagnostic with a warning only when server acceptance is uncertain.
 */
export function safeSubmissionFailureMessage(value: unknown, notice: string): string {
  const kind = classifyBackendFailure(value).kind;
  return safeBackendMessage(value) +
    (kind === "network" || kind === "unavailable" || kind === "unknown"
      ? " " + notice : "");
}
