/**
 * @module job-attachment-store
 * @remarks Explicit, read-only existing-task attachment for the active API origin.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { BackendClient } from "./backend.client";
import { classifyBackendFailure, safeBackendMessage } from "./backend-error";
import { ConnectionStore } from "./connection.store";
import { JobsStore } from "./jobs.store";
import { parseExistingJobId } from "./job-attachment";
import { LocaleStore } from "./locale.store";

/** @public Verify an existing ID before adding it to a session queue. */
@Injectable()
export class JobAttachmentStore {
  private readonly api = inject(BackendClient);
  private readonly jobs = inject(JobsStore);
  private readonly connection = inject(ConnectionStore);
  private readonly locale = inject(LocaleStore);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  /**
   * @public Verify a server-owned task and begin observing it without submitting.
   * @returns True only after a matching authorized, read-only server lookup.
   */
  async attach(rawId: string): Promise<boolean> {
    if (this.busy()) return false;
    this.error.set(null);
    this.notice.set(null);
    const id = parseExistingJobId(rawId);
    if (!id) { this.error.set(this.locale.text("jobs.attachInvalid")); return false; }
    if (this.jobs.pollingBlocked()) {
      this.error.set(this.locale.text("jobs.attachBlocked")); return false;
    }
    if (this.jobs.jobs().some(job => job.id === id)) {
      this.error.set(this.locale.text("jobs.attachDuplicate")); return false;
    }
    this.busy.set(true);
    const revision = this.connection.revision();
    try {
      await this.api.existingJob(id);
      if (revision !== this.connection.revision()) return false;
      if (!this.jobs.trackExisting(id)) {
        this.error.set(this.locale.text("jobs.attachDuplicate")); return false;
      }
      this.notice.set(this.locale.text("jobs.attachSuccess"));
      return true;
    } catch (error: unknown) {
      if (revision === this.connection.revision()) {
        this.error.set(classifyBackendFailure(error).kind === "missing"
          ? this.locale.text("jobs.attachMissing")
          : this.locale.text("jobs.attachError") + " " + safeBackendMessage(error));
      }
      return false;
    } finally {
      this.busy.set(false);
    }
  }
}
