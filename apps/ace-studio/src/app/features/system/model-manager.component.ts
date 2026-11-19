/**
 * @module model-manager-component
 * @remarks Explicit, model-gated DiT and 5Hz LM initialization on the existing server.
 * @public
 */
import { Component, computed, inject, signal } from "@angular/core";
import { BackendStore } from "../../core/backend.store";
import { LocaleStore } from "../../core/locale.store";
import { ConnectionStore } from "../../core/connection.store";

/** @public Backend model lifecycle UI; no model loads without double confirmation. */
@Component({
  selector: "ace-model-manager",
  standalone: true,
  templateUrl: "./model-manager.component.html"
})
export class ModelManagerComponent {
  readonly backend = inject(BackendStore);
  readonly locale = inject(LocaleStore);
  private readonly connection = inject(ConnectionStore);
  readonly languageModel = signal("");
  readonly pending = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly selectedDit = computed(() => {
    const inventory = this.backend.inventory();
    const primary = inventory?.default_model || "";
    return inventory?.models.some(entry => entry.name === primary && entry.is_loaded)
      ? primary : "";
  });

  /** @public Select a server-reported LM name without initializing it. */
  changeLanguageModel(event: Event): void {
    const element = event.target;
    if (!(element instanceof HTMLSelectElement)) return;
    this.languageModel.set(element.value);
    this.pending.set(null);
    this.notice.set(null);
  }

  /** @public Require two identical actions before possible GPU allocation/download. */
  async initialize(model: string, lmModel?: string): Promise<void> {
    if (this.backend.busy() || !model) return;
    const inventory = this.backend.inventory();
    if (!inventory?.models.some(entry => entry.name === model)) return;
    if (lmModel && !inventory.lm_models?.some(entry => entry.name === lmModel)) {
      this.notice.set(this.locale.text("models.errorUnlisted"));
      return;
    }
    const key = JSON.stringify({
      revision: this.connection.revision(), dit: model, lm: lmModel || null
    });
    if (this.pending() !== key) {
      this.pending.set(key);
      this.notice.set(lmModel
        ? this.locale.text("models.confirmReinit")
        : this.locale.text("models.confirmInit"));
      return;
    }
    this.pending.set(null);
    this.notice.set(null);
    await this.backend.load(model, lmModel);
    if (!this.backend.error()) this.notice.set(this.locale.text("models.completed"));
  }

  /** @public Confirm a current DiT plus explicit 5Hz LM selection. */
  async initializeLanguageModel(): Promise<void> {
    const dit = this.selectedDit(), lm = this.languageModel();
    if (!dit || !lm) return;
    await this.initialize(dit, lm);
  }

  /** @public Stable key used to display pending model confirmation. */
  awaiting(model: string, lmModel?: string): boolean {
    return this.pending() === JSON.stringify({
      revision: this.connection.revision(), dit: model, lm: lmModel || null
    });
  }
}



