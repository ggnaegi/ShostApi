import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Album, GalleriesDefinition, Logo } from './gallery';
import { environment } from '../../../environments/environment';

/** PascalCase shape returned by the Azure Function (matches the C# GalleryAlbum DTO). */
interface AlbumResponse {
  Year: number;
  Images: { Url: string; Alt: string }[];
}

/** PascalCase shape returned by the Azure Function (matches the C# GalleryLogo DTO). */
interface LogoResponse {
  Year: number;
  Url: string;
  Alt: string;
  ShowGallery: boolean;
  ShowPage: boolean;
  ShowOnWelcomePage: boolean;
  ShowOnCarousel: boolean;
  VideoUrl: string;
  Teaser: string;
}

/** Editable metadata of a gallery year sent to the API. */
export interface GalleryLogoInput {
  year: number;
  alt: string;
  showGallery: boolean;
  showPage: boolean;
  showOnWelcomePage: boolean;
  showOnCarousel: boolean;
  videoUrl: string;
  teaser: string;
}

export interface GalleryMediaTexts {
  mediaPageTitle: string;
  mediaPageDescription: string;
}

export interface GallerySessionInput {
  year: number;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryAdminService {
  private readonly http = inject(HttpClient);

  /** Inserts or updates the metadata of a gallery year and returns the updated logo. */
  saveMediaTexts(texts: GalleryMediaTexts): Observable<GalleriesDefinition> {
    return this.http.post<GalleriesDefinition>(
      environment.galleryEndpointUrl,
      texts,
      { withCredentials: true }
    );
  }

  createSession(input: GallerySessionInput): Observable<Logo> {
    return this.http
      .post<LogoResponse>(`${environment.galleryEndpointUrl}/session`, input, {
        withCredentials: true,
      })
      .pipe(map(response => this.toLogo(response)));
  }

  /** Inserts or updates the metadata of a gallery year and returns the updated logo. */
  saveLogo(logo: GalleryLogoInput): Observable<Logo> {
    return this.http
      .post<LogoResponse>(`${environment.galleryEndpointUrl}/logo`, logo, {
        withCredentials: true,
      })
      .pipe(map(response => this.toLogo(response)));
  }

  /** Uploads a flyer image (stored as assets/flyers/{year}.jpg) and returns the updated logo. */
  uploadFlyer(year: number, file: File): Observable<Logo> {
    const form = new FormData();
    form.append('files', file, file.name);

    return this.http
      .post<LogoResponse>(
        `${environment.galleryEndpointUrl}/${year}/flyer`,
        form,
        { withCredentials: true }
      )
      .pipe(map(response => this.toLogo(response)));
  }

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

  /** Maps the PascalCase API response to the camelCase Logo model used across the app. */
  private toLogo(response: LogoResponse): Logo {
    return {
      year: response.Year,
      url: response.Url,
      alt: response.Alt,
      showGallery: response.ShowGallery,
      showPage: response.ShowPage,
      showOnWelcomePage: response.ShowOnWelcomePage,
      showOnCarousel: response.ShowOnCarousel,
      videoUrl: response.VideoUrl,
      teaser: response.Teaser,
    };
  }
}
