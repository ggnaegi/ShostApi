import {
  Component,
  ChangeDetectionStrategy,
  input,
  OnChanges,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatAccordion,
  MatExpansionPanelContent,
} from '@angular/material/expansion';

import { GalleriesDefinition, GalleryAdminItem } from '../../../gallery/api/gallery';
import { GalleryLogoInput } from '../../../gallery/api/gallery-admin.service';
import { GalleryItemAdminComponent } from './gallery-item-admin.component';

@Component({
  selector: 'app-galleries-admin',
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanelContent,
    GalleryItemAdminComponent,
  ],
  templateUrl: './galleries-admin.component.html',
  styleUrl: './galleries-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleriesAdminComponent implements OnChanges {
  readonly items = input<GalleryAdminItem[]>([]);
  readonly galleryDefinition = input<GalleriesDefinition | null>(null);

  readonly busyYears = input<number[]>([]);

  readonly logoSaved = output<GalleryLogoInput>();

  readonly flyerSelected = output<{ year: number; file: File }>();

  readonly imagesSelected = output<{ year: number; files: File[] }>();

  readonly imageDeleted = output<{ year: number; url: string }>();

  readonly galleryAdded = output<number>();
  readonly mediaTextsSaved = output<{
    mediaPageTitle: string;
    mediaPageDescription: string;
  }>();

  protected readonly newYear = signal<number | null>(null);
  protected mediaPageTitle = '';
  protected mediaPageDescription = '';

  ngOnChanges(): void {
    const definition = this.galleryDefinition();
    if (definition) {
      this.mediaPageTitle = definition.mediaPageTitle ?? '';
      this.mediaPageDescription = definition.mediaPageDescription ?? '';
    }
  }

  saveMediaTexts(): void {
    this.mediaTextsSaved.emit({
      mediaPageTitle: this.mediaPageTitle,
      mediaPageDescription: this.mediaPageDescription,
    });
  }

  isBusy(year: number): boolean {
    return this.busyYears().includes(year);
  }

  onFlyerSelected(year: number, file: File): void {
    this.flyerSelected.emit({ year, file });
  }

  onImagesSelected(year: number, files: File[]): void {
    this.imagesSelected.emit({ year, files });
  }

  onImageDeleted(year: number, url: string): void {
    this.imageDeleted.emit({ year, url });
  }

  addGallery(): void {
    const year = this.newYear();
    if (!year || year < 1900 || year > 3000) {
      return;
    }
    if (this.items().some(item => item.logo.year === year)) {
      return;
    }
    this.galleryAdded.emit(year);
    this.newYear.set(null);
  }
}
