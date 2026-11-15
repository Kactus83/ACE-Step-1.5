/**
 * @module create-expert-component
 * @remarks Explicit advanced diffusion, DCW and 5Hz LM controls for the ACE-Step API.
 * @public
 */
import { Component, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { createGenerationForm } from "./create.form";

/** @public Advanced parameters bound to the same form as the creation editor. */
@Component({
  selector: "ace-create-expert",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./create-expert.component.html"
})
export class CreateExpertComponent {
  /** @public Shared typed reactive generation form. */
  readonly form = input.required<ReturnType<typeof createGenerationForm>>();
}
