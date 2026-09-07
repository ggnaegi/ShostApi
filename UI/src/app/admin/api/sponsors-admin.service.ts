import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sponsor, SponsorsConfig } from '../../about/api/organisation';

/** PascalCase shape returned by the Azure Function (matches the C# SponsorsConfig DTO). */
interface SponsorsConfigResponse {
  BenefactorsTitle: string;
  BenefactorsBody: string;
  SponsorsTitle: string;
  SponsorsBody: string;
  SponsorsLogos: { Filename: string; Alt: string }[];
}

export interface SponsorsTexts {
  benefactorsTitle: string;
  benefactorsBody: string;
  sponsorsTitle: string;
  sponsorsBody: string;
}

@Injectable({ providedIn: 'root' })
export class SponsorsAdminService {
  private readonly http = inject(HttpClient);

  /** Persists the sponsors text fields and returns the updated configuration. */
  saveTexts(texts: SponsorsTexts): Observable<SponsorsConfig> {
    return this.http
      .post<SponsorsConfigResponse>(environment.sponsorsEndpointUrl, texts, {
        withCredentials: true,
      })
      .pipe(map(response => this.toConfig(response)));
  }

  /** Uploads logo images to assets/sponsors/ and returns the updated configuration. */
  uploadLogos(files: File[]): Observable<SponsorsConfig> {
    const form = new FormData();
    files.forEach(file => form.append('files', file, file.name));

    return this.http
      .post<SponsorsConfigResponse>(
        `${environment.sponsorsEndpointUrl}/logos`,
        form,
        { withCredentials: true }
      )
      .pipe(map(response => this.toConfig(response)));
  }

  /** Deletes the given logo filenames and returns the updated configuration. */
  deleteLogos(filenames: string[]): Observable<SponsorsConfig> {
    return this.http
      .request<SponsorsConfigResponse>(
        'delete',
        `${environment.sponsorsEndpointUrl}/logos`,
        { body: { filenames }, withCredentials: true }
      )
      .pipe(map(response => this.toConfig(response)));
  }

  /** Maps the PascalCase API response to the camelCase model used across the app. */
  private toConfig(response: SponsorsConfigResponse): SponsorsConfig {
    return {
      benefactorsTitle: response.BenefactorsTitle ?? '',
      benefactorsBody: response.BenefactorsBody ?? '',
      sponsorsTitle: response.SponsorsTitle ?? '',
      sponsorsBody: response.SponsorsBody ?? '',
      sponsorsLogos: (response.SponsorsLogos ?? []).map(
        (logo): Sponsor => ({
          filename: logo.Filename,
          alt: logo.Alt,
        })
      ),
    };
  }
}
