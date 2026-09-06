import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Album } from '../../api/gallery';

@Component({
  selector: 'app-gallery-dialog',
  templateUrl: './gallery-dialog.component.html',
  imports: [MatDialogContent, MatDialogTitle, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./gallery-dialog.component.css'],
})
export class GalleryDialogComponent {
  readonly data = inject<Album>(MAT_DIALOG_DATA);
  readonly isMobile = signal(false);
  readonly currentIndex = signal(0);
  readonly thumbnailLimit = computed(() => (this.isMobile() ? 5 : 10));
  readonly visibleImages = computed(() => {
    const images = this.data.images;
    const limit = Math.min(this.thumbnailLimit(), images.length);

    if (!images.length) {
      return [];
    }

    const start = Math.max(
      0,
      Math.min(this.currentIndex() - Math.floor(limit / 2), images.length - limit)
    );

    return images.slice(start, start + limit);
  });
  readonly currentImage = computed(
    () => this.data.images[this.currentIndex()] ?? this.data.images[0]
  );
  readonly hasMultipleImages = computed(() => this.data.images.length > 1);

  constructor() {
    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  nextImage(): void {
    if (this.data.images.length === 0) {
      return;
    }

    this.currentIndex.set((this.currentIndex() + 1) % this.data.images.length);
  }

  previousImage(): void {
    if (this.data.images.length === 0) {
      return;
    }

    const nextIndex = this.currentIndex() - 1;
    this.currentIndex.set(nextIndex < 0 ? this.data.images.length - 1 : nextIndex);
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.data.images.length) {
      this.currentIndex.set(index);
    }
  }

  private updateIsMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
}
