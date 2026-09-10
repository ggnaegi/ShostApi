import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { GalleriesAdminComponent } from '../pages/galleries-admin/galleries-admin.component';
import { AppDataStore } from '../../store/app-data/app-data.store';
import {
  GalleryAdminService,
  GalleryLogoInput,
} from '../../gallery/api/gallery-admin.service';
import { GalleryAdminItem } from '../../gallery/api/gallery';

@Component({
  selector: 'app-galleries-admin-container',
  imports: [GalleriesAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-galleries-admin
      [items]="items()"
      [galleryDefinition]="definition()"
      [busyYears]="busyYears()"
      (mediaTextsSaved)="saveMediaTexts($event)"
      (logoSaved)="saveLogo($event)"
      (flyerSelected)="uploadFlyer($event)"
      (imagesSelected)="uploadImages($event)"
      (imageDeleted)="deleteImage($event)"
      (galleryAdded)="addGallery($event)" />
  `,
})
export class GalleriesAdminContainerComponent implements OnInit {
  protected readonly busyYears = signal<number[]>([]);

  private readonly appDataStore = inject(AppDataStore);
  private readonly galleryAdminService = inject(GalleryAdminService);

  protected readonly definition = this.appDataStore.galleryDefinition;

  protected readonly items = computed<GalleryAdminItem[]>(() => {
    const definition = this.definition();
    if (!definition) {
      return [];
    }

    return [...definition.logos]
      .sort((a, b) => b.year - a.year)
      .map(logo => ({
        logo,
        album:
          definition.galleries.find(album => album.year === logo.year) ?? null,
      }));
  });

  ngOnInit(): void {
    this.appDataStore.loadGalleryDefinition();
  }

  public saveLogo(logo: GalleryLogoInput): void {
    this.setBusy(logo.year, true);
    this.galleryAdminService
      .saveLogo(logo)
      .pipe(finalize(() => this.setBusy(logo.year, false)))
      .subscribe(updated => this.appDataStore.setGalleryLogo(updated));
  }

  public saveMediaTexts(texts: {
    mediaPageTitle: string;
    mediaPageDescription: string;
  }): void {
    this.galleryAdminService
      .saveMediaTexts(texts)
      .subscribe(config => this.appDataStore.setGalleryDefinition(config));
  }

  public uploadFlyer({ year, file }: { year: number; file: File }): void {
    this.setBusy(year, true);
    this.galleryAdminService
      .uploadFlyer(year, file)
      .pipe(finalize(() => this.setBusy(year, false)))
      .subscribe(updated => this.appDataStore.setGalleryLogo(updated));
  }

  public uploadImages({ year, files }: { year: number; files: File[] }): void {
    this.setBusy(year, true);
    this.galleryAdminService
      .uploadImages(year, files)
      .pipe(finalize(() => this.setBusy(year, false)))
      .subscribe(album => this.appDataStore.setGalleryAlbum(album));
  }

  public deleteImage({ year, url }: { year: number; url: string }): void {
    this.setBusy(year, true);
    this.galleryAdminService
      .deleteImages(year, [url])
      .pipe(finalize(() => this.setBusy(year, false)))
      .subscribe(album => this.appDataStore.setGalleryAlbum(album));
  }

  public addGallery(year: number): void {
    this.setBusy(year, true);
    this.galleryAdminService
      .saveLogo({
        year,
        alt: `logo-${year}`,
        teaser: '',
        showPage: false,
        showGallery: false,
        showOnWelcomePage: false,
        videoUrl: '',
      })
      .pipe(finalize(() => this.setBusy(year, false)))
      .subscribe(updated => this.appDataStore.setGalleryLogo(updated));
  }

  private setBusy(year: number, busy: boolean): void {
    const current = this.busyYears();
    if (busy) {
      if (!current.includes(year)) {
        this.busyYears.set([...current, year]);
      }
    } else {
      this.busyYears.set(current.filter(y => y !== year));
    }
  }
}
