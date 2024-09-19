import { Injectable } from '@angular/core';
import { AbstractGalleryService } from './abstract.gallery.service';
import { Observable, shareReplay } from 'rxjs';
import { GalleriesDefinition } from '../api/gallery';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GalleryService implements AbstractGalleryService {
  private galleryConfigJson = 'assets/galleries/gallery-config.json';

  private galleriesDefinition$: Observable<GalleriesDefinition> | undefined;

  constructor(private http: HttpClient) {}

  getGalleryDefinition$(): Observable<GalleriesDefinition> {
    if(!this.galleriesDefinition$){
      this.galleriesDefinition$ = this.http.get<GalleriesDefinition>(this.galleryConfigJson).pipe(shareReplay());
    }
    return this.galleriesDefinition$;
  }
}
