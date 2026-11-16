/**
 * @module create-source-edit-component
 * @remarks Progressive source-conditioned controls for backend-authoritative generation.
 * @public
 */
import { Component, inject, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { createGenerationForm } from "./create.form";
import { LocaleStore } from "../../core/locale.store";

/** @public Advanced source transformation controls bound to the shared typed form. */
@Component({
  selector: "ace-create-source-edit",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./create-source-edit.component.html"
})
export class CreateSourceEditComponent {
  readonly locale = inject(LocaleStore);
  readonly form = input.required<ReturnType<typeof createGenerationForm>>();
  readonly mode = input.required<string>();
}



