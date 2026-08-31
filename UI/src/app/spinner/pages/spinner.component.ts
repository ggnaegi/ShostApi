import { Component, inject } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';
import { SpinnerService } from '../services/spinner.service';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  template: `
    @if (spinnerService.isLoading$ | async) {
      <div class="overlay">
        <mat-spinner></mat-spinner>
      </div>
    }
  `,
  imports: [MatProgressSpinner, AsyncPipe],
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent {
  public spinnerService = inject(SpinnerService);
}
