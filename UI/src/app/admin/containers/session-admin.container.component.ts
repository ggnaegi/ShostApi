import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { SessionAdminComponent } from '../pages/session-admin/session-admin.component';
import { AppDataStore } from '../../store/app-data/app-data.store';
import { Session } from '../../session/api/session-element';
import { GalleryAdminService } from '../../gallery/api/gallery-admin.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-session-admin-container',
    imports: [SessionAdminComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <app-session-admin
      [sessionData]="sessionData()"
      [galleryImages]="galleryImages()"
      [galleryBusy]="galleryBusy()"
      (yearChanged)="updateYear($event)"
      (sessionSubmitted)="updateSession($event)"
      (imagesUploaded)="uploadImages($event)"
      (imageDeleted)="deleteImage($event)"></app-session-admin>
  `
})
export class SessionAdminContainerComponent implements OnInit {
  protected readonly year = signal(2026);

  protected readonly galleryBusy = signal(false);

  private readonly appDataStore = inject(AppDataStore);
  private readonly galleryAdminService = inject(GalleryAdminService);

  protected readonly sessionData = this.appDataStore.sessionForYear(this.year);

  private readonly galleryAlbum = this.appDataStore.galleryAlbumForYear(
    this.year
  );

  protected readonly galleryImages = computed(
    () => this.galleryAlbum()?.images ?? []
  );

  ngOnInit(): void {
    this.appDataStore.loadSession({ year: this.year(), adminRoute: true });
    this.appDataStore.loadGalleryDefinition();
  }

  public updateYear(year: number): void {
    this.year.set(year);
    this.appDataStore.loadSession({ year, adminRoute: true });
  }

  public updateSession(session: Session) {
    this.appDataStore.updateSession(session);
  }

  public uploadImages(files: File[]): void {
    this.galleryBusy.set(true);
    this.galleryAdminService
      .uploadImages(this.year(), files)
      .pipe(finalize(() => this.galleryBusy.set(false)))
      .subscribe(album => this.appDataStore.setGalleryAlbum(album));
  }

  public deleteImage(url: string): void {
    this.galleryBusy.set(true);
    this.galleryAdminService
      .deleteImages(this.year(), [url])
      .pipe(finalize(() => this.galleryBusy.set(false)))
      .subscribe(album => this.appDataStore.setGalleryAlbum(album));
  }
}
