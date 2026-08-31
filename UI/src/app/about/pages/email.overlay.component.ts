import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EmailSendResult } from '../api/organisation';

@Component({
  selector: 'app-email-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let emailSentResult = result();
    @if (emailSentResult) {
      <div class="overlay">
        @if (emailSentResult?.success) {
          <i class="fa fa-check-circle" aria-hidden="true"></i>
        } @else {
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
        }

        <span>{{ result()?.message }}</span>
      </div>
    }
  `,
  imports: [],
  styles: [
    `
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
        font-family: 'Avenir Next Light', serif;
        font-size: 12px;
        color: white;
      }
    `,
  ],
})
export class EmailOverlayComponent {
  readonly result = input<EmailSendResult | null | undefined>(undefined);
}
