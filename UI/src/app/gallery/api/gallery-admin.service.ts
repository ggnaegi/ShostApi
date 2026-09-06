import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Album } from './gallery';
import { environment } from '../../../environments/environment';

/** PascalCase shape returned by the Azure Function (matches the C# GalleryAlbum DTO). */
interface AlbumResponse {
  Year: number;
  Images: { Url: string; Alt: string }[];
}

@Injectable({ providedIn: 'root' })
export class GalleryAdminService {
  private readonly http = inject(HttpClient);

  /** Uploads images to assets/galleries/{year}/ and returns the updated album. */
  uploadImages(year: number, files: File[]): Observable<Album> {
    const form = new FormData();
    files.forEach(file => form.append('files', file, file.name));

    return this.http
      .post<AlbumResponse>(`${environment.galleryEndpointUrl}/${year}`, form, {
        withCredentials: true,
      })
      .pipe(map(response => this.toAlbum(response)));
  }

  /** Deletes the given image urls for a year and returns the updated album. */
  deleteImages(year: number, urls: string[]): Observable<Album> {
    return this.http
      .request<AlbumResponse>(
        'delete',
        `${environment.galleryEndpointUrl}/${year}`,
        { body: { urls }, withCredentials: true }
      )
      .pipe(map(response => this.toAlbum(response)));
  }

  /** Maps the PascalCase API response to the camelCase Album model used across the app. */
  private toAlbum(response: AlbumResponse): Album {
    return {
      year: response.Year,
      images: (response.Images ?? []).map(image => ({
        url: image.Url,
        alt: image.Alt,
      })),
    };
  }
}
