import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { SpinnerService } from '../spinner/services/spinner.service';

@Component({
  selector: 'app-image-with-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  styleUrl: './image-with-loading.component.scss',
  template: `
    <img [src]="src()" [alt]="alt()" [class]="class()" (load)="loaded()" />
  `,
})
export class ImageWithLoadingComponent {
  public readonly src = input<string>();

  public readonly alt = input<string>();

  public readonly class = input<string>();

  private readonly spinnerService = inject(SpinnerService);

  constructor() {
    this.spinnerService.show();
  }

  public loaded(): void {
    this.spinnerService.hide();
  }
}
