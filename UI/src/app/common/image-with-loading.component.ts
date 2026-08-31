import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-image-with-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  styleUrl: './image-with-loading.component.scss',
  template: `
    <div
      class="image-with-loading-container"
      [class.is-loading]="!imageLoaded()">
      @if (!imageLoaded()) {
        <div class="skeleton-shimmer skeleton-image-placeholder"></div>
      }
      <img
        [src]="src()"
        [alt]="alt()"
        [class]="class()"
        [class.image-loaded]="imageLoaded()"
        (load)="loaded()" />
    </div>
  `,
})
export class ImageWithLoadingComponent {
  public readonly src = input<string>();

  public readonly alt = input<string>();

  public readonly class = input<string>();

  protected readonly imageLoaded = signal(false);

  public loaded(): void {
    this.imageLoaded.set(true);
  }
}
