import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpinnerService } from '../spinner/services/spinner.service';

@Component({
  selector: 'app-image-with-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  styleUrl: './image-with-loading.component.scss',
  template: `
    <img [src]="src" [alt]="alt" [class]="class" (load)="loaded()" />
  `,
})
export class ImageWithLoadingComponent {
  @Input()
  public src?: string;

  @Input()
  public alt?: string;

  @Input()
  public class?: string;

  constructor(private readonly spinnerService: SpinnerService) {
    this.spinnerService.show();
  }

  public loaded(): void {
    this.spinnerService.hide();
  }
}
