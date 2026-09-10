import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { GalleryComponent } from '../pages/gallery.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-gallery-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GalleryComponent],
  template: `
    <app-gallery
      [galleriesDefinitions]="galleryDefinition()"
      [welcomeMessage]="welcomeMessage()"
      [mediaMode]="mediaMode()"
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class GalleryContainerComponent implements OnInit {
  readonly welcomeMessage = input('');
  readonly mediaMode = input(false);
  readonly galleryDataLoaded = output<boolean>();
  readonly yearChanged = output<number>();
  readonly knownYears = output<number[]>();

  private readonly appDataStore = inject(AppDataStore);
  protected readonly galleryDefinition = this.appDataStore.galleryDefinition;

  private readonly knownYearsEffect = effect(() => {
    const years = (this.galleryDefinition()?.logos ?? [])
      .filter(logo => (this.mediaMode() ? logo.showGallery : logo.showPage))
      .map(logo => logo.year)
      .sort((a, b) => b - a);

    this.knownYears.emit(years);
  });

  ngOnInit(): void {
    this.appDataStore.loadGalleryDefinition();
  }

  public onYearChanged(year: number): void {
    this.yearChanged.emit(year);
  }
}
