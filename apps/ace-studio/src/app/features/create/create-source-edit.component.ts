/**
 * @module create-source-edit-component
 * @remarks Progressive source-conditioned controls for backend-authoritative generation.
 * @public
 */
import { Component, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TaskType } from "../../core/api.types";
import { createGenerationForm } from "./create.form";

/** @public Advanced source transformation controls bound to the shared typed form. */
@Component({
  selector: "ace-create-source-edit",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./create-source-edit.component.html"
})
export class CreateSourceEditComponent {
  readonly form = input.required<ReturnType<typeof createGenerationForm>>();
  readonly mode = input.required<TaskType>();
}

