import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { EmailSendResult } from '../api/organisation';

@Component({
  selector: 'app-email-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="result" class="overlay">
      <i *ngIf="result.success" class="fa fa-check-circle" aria-hidden="true"></i>
      <i *ngIf="!result.success" class="fa fa-exclamation-triangle" aria-hidden="true"></i>
      <span>{{ result.message }}</span>
    </div>
  `,
  imports: [
    NgIf,
  ],
  styles: [`
    .overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #803357;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      font-size: 18px;
    }

    i {
      margin-right: 10px;
    }

    span {
      font-family: 'Montserrat', serif;
      font-size: 12px;
      color: white;
    }
  `],
})
export class EmailOverlayComponent {
  @Input() result: EmailSendResult | undefined;
}
