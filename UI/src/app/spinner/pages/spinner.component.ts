import {Component} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AsyncPipe, NgIf} from "@angular/common";
import {SpinnerService} from "../services/spinner.service"; // Adjust the path as necessary

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  template: `
    <div *ngIf="spinnerService.isLoading$ | async" class="overlay">
      <mat-spinner></mat-spinner>
    </div>
  `,
  imports: [
    MatProgressSpinner,
    NgIf,
    AsyncPipe
  ],
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {
  constructor(public spinnerService: SpinnerService) {
  }
}
