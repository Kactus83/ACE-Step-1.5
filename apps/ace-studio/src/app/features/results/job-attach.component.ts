/**
 * @module job-attach-component
 * @remarks Accessible manual task recovery without any generation request.
 * @public
 */
import { Component, inject, signal } from "@angular/core";
import { JobAttachmentStore } from "../../core/job-attachment.store";
import { LocaleStore } from "../../core/locale.store";

/** @public Explicit user-controlled attachment to one server-owned task ID. */
@Component({
  selector: "ace-job-attach",
  standalone: true,
  providers: [JobAttachmentStore],
  templateUrl: "./job-attach.component.html"
})
export class JobAttachComponent {
  readonly attachment = inject(JobAttachmentStore);
  readonly locale = inject(LocaleStore);
  readonly taskId = signal("");

  /** @public Keep the unsubmitted ID in ephemeral component memory only. */
  idChanged(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.taskId.set(event.target.value);
    }
  }

  /** @public Verify and attach without invoking any GPU mutation endpoint. */
  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (await this.attachment.attach(this.taskId())) this.taskId.set("");
  }
}
