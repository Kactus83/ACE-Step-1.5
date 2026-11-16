/**
 * @module create-expert-component
 * @remarks Explicit advanced diffusion, DCW and 5Hz LM controls for the ACE-Step API.
 * @public
 */
import { Component, inject, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { createGenerationForm } from "./create.form";
import { LocaleStore } from "../../core/locale.store";

/** @public Advanced parameters bound to the same form as the creation editor. */
@Component({
  selector: "ace-create-expert",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./create-expert.component.html"
})
export class CreateExpertComponent {
  readonly locale = inject(LocaleStore);
  /** @public Shared typed reactive generation form. */
  readonly form = input.required<ReturnType<typeof createGenerationForm>>();
}

