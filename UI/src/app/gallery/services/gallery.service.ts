import { Injectable } from '@angular/core';
import { AbstractGalleryService } from './abstract.gallery.service';
import { Observable } from 'rxjs';
import { GalleriesDefinition } from '../api/gallery';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GalleryService implements AbstractGalleryService {
  private galleryConfigJson = 'assets/galleries/gallery-config.json'; // Path to the JSON file

  constructor(private http: HttpClient) {}

  getGalleryDefinition$(): Observable<GalleriesDefinition> {
    return this.http.get<GalleriesDefinition>(this.galleryConfigJson);
  }
}
