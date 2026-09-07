import {
  Component,
  ChangeDetectionStrategy,
  input,
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
} from '@angular/material/expansion';

import { GalleryAdminItem } from '../../../gallery/api/gallery';
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
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    GalleryItemAdminComponent,
  ],
  templateUrl: './galleries-admin.component.html',
  styleUrl: './galleries-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleriesAdminComponent {
  readonly items = input<GalleryAdminItem[]>([]);

  readonly busyYears = input<number[]>([]);

  readonly logoSaved = output<GalleryLogoInput>();

  readonly flyerSelected = output<{ year: number; file: File }>();

  readonly imagesSelected = output<{ year: number; files: File[] }>();

  readonly imageDeleted = output<{ year: number; url: string }>();

  readonly galleryAdded = output<number>();

  protected readonly newYear = signal<number | null>(null);

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
