import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AppDataStore } from '../../../store/app-data/app-data.store';
import { Album } from '../../api/gallery';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [],
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryPageComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly appDataStore = inject(AppDataStore);

  readonly currentIndex = signal(0);
  readonly isMobile = signal(false);
  readonly galleryDefinition = this.appDataStore.galleryDefinition;
  readonly year = signal<number | null>(null);

  readonly thumbnailLimit = computed(() => (this.isMobile() ? 5 : 10));

  readonly gallery = computed<Album | null>(() => {
    const year = this.year();
    const definition = this.galleryDefinition();

    if (!year || !definition) {
      return null;
    }

    return definition.galleries.find(gallery => gallery.year === year) ?? null;
  });

  readonly visibleImages = computed(() => {
    const images = this.gallery()?.images ?? [];
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

  readonly currentImage = computed(() => {
    const gallery = this.gallery();
    if (!gallery?.images.length) {
      return null;
    }

    return gallery.images[this.currentIndex()] ?? gallery.images[0];
  });

  readonly hasMultipleImages = computed(
    () => (this.gallery()?.images.length ?? 0) > 1
  );

  constructor() {
    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  ngOnInit(): void {
    this.appDataStore.loadGalleryDefinition();

    this.route.paramMap.subscribe(params => {
      const rawYear = params.get('year');
      const parsedYear = rawYear ? Number(rawYear) : null;
      this.year.set(Number.isFinite(parsedYear) ? parsedYear : null);
      this.currentIndex.set(0);
    });
  }

  previousImage(): void {
    const images = this.gallery()?.images ?? [];
    if (!images.length) {
      return;
    }

    const nextIndex = this.currentIndex() - 1;
    this.currentIndex.set(nextIndex < 0 ? images.length - 1 : nextIndex);
  }

  nextImage(): void {
    const images = this.gallery()?.images ?? [];
    if (!images.length) {
      return;
    }

    this.currentIndex.set((this.currentIndex() + 1) % images.length);
  }

  selectImage(index: number): void {
    const images = this.gallery()?.images ?? [];
    if (index >= 0 && index < images.length) {
      this.currentIndex.set(index);
    }
  }

  goBack(): void {
    this.location.back();
  }

  private updateIsMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
}
