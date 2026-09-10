import {
  Component,
  inject,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FlexModule } from '@angular/flex-layout';

import { GalleryAdminItem, Image } from '../../../gallery/api/gallery';
import { GalleryLogoInput } from '../../../gallery/api/gallery-admin.service';

@Component({
  selector: 'app-gallery-item-admin',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSlideToggle,
    MatPaginator,
    FlexModule,
  ],
  templateUrl: './gallery-item-admin.component.html',
  styleUrls: ['./gallery-item-admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryItemAdminComponent {
  readonly item = input.required<GalleryAdminItem>();
  readonly busy = input(false);

  readonly logoSaved = output<GalleryLogoInput>();
  readonly flyerSelected = output<File>();
  readonly imagesSelected = output<File[]>();
  readonly imageDeleted = output<string>();

  readonly pageSize = 10;
  pageIndex = 0;

  private readonly fb = inject(FormBuilder);

  readonly metaForm = this.fb.nonNullable.group({
    Alt: ['', [Validators.maxLength(255)]],
    Teaser: [''],
    VideoUrl: ['', [Validators.maxLength(2048), Validators.pattern(/^https?:\/\/.+/)]],
    ShowPage: [false],
    ShowGallery: [false],
    ShowOnWelcomePage: [false],
  });

  private readonly itemEffect = effect(() => {
    const item = this.item();

    this.clampPageIndex(item.album?.images.length ?? 0);

    this.metaForm.patchValue({
      Alt: item.logo.alt ?? '',
      Teaser: item.logo.teaser ?? '',
      VideoUrl: item.logo.videoUrl ?? '',
      ShowPage: item.logo.showPage ?? false,
      ShowGallery: item.logo.showGallery ?? false,
      ShowOnWelcomePage: item.logo.showOnWelcomePage ?? false,
    });
  });

  get year(): number {
    return this.item().logo.year;
  }

  get flyerUrl(): string {
    return this.item().logo.url;
  }

  get images(): Image[] {
    return this.item().album?.images ?? [];
  }

  /** Only the thumbnails for the current page, to keep the DOM light. */
  get pagedImages(): Image[] {
    const start = this.pageIndex * this.pageSize;
    return this.images.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }

  onSave(): void {
    if (this.metaForm.invalid) {
      return;
    }

    const value = this.metaForm.getRawValue();

    this.logoSaved.emit({
      year: this.year,
      alt: value.Alt,
      teaser: value.Teaser,
      videoUrl: value.VideoUrl,
      showPage: value.ShowPage,
      showGallery: value.ShowGallery,
      showOnWelcomePage: value.ShowOnWelcomePage,
    });
  }

  onFlyerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      this.flyerSelected.emit(file);
    }

    input.value = '';
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (files.length > 0) {
      this.imagesSelected.emit(files);
    }

    input.value = '';
  }

  deleteImage(url: string): void {
    this.imageDeleted.emit(url);
  }

  /** Keeps the current page valid after images are added or removed. */
  private clampPageIndex(imageCount: number): void {
    const lastPage = Math.max(0, Math.ceil(imageCount / this.pageSize) - 1);

    if (this.pageIndex > lastPage) {
      this.pageIndex = lastPage;
    }
  }
}
