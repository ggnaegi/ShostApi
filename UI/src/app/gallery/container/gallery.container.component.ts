import {
  ChangeDetectionStrategy,
  Component,
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
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class GalleryContainerComponent implements OnInit {
  readonly welcomeMessage = input('');
  readonly galleryDataLoaded = output<boolean>();
  readonly yearChanged = output<number>();

  private readonly appDataStore = inject(AppDataStore);
  protected readonly galleryDefinition = this.appDataStore.galleryDefinition;

  ngOnInit(): void {
    this.appDataStore.loadGalleryDefinition();
  }

  public onYearChanged(year: number): void {
    this.yearChanged.emit(year);
  }
}
