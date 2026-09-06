import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** PascalCase shape returned by the Azure Function. */
interface PortraitUploadResponse {
  Path: string;
}

@Injectable({ providedIn: 'root' })
export class PortraitAdminService {
  private readonly http = inject(HttpClient);

  /**
   * Uploads a portrait to the given web-relative directory (e.g. `assets/2025/Gallery/Conductor`).
   * When an existing path is supplied it is deleted server-side. Returns the new web-relative path.
   */
  uploadPortrait(
    directory: string,
    file: File,
    oldPath?: string
  ): Observable<string> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('directory', directory);
    if (oldPath) {
      form.append('oldPath', oldPath);
    }

    return this.http
      .post<PortraitUploadResponse>(environment.portraitEndpointUrl, form, {
        withCredentials: true,
      })
      .pipe(map(response => response.Path));
  }
}
