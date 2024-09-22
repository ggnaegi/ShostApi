import { Injectable } from '@angular/core';
import { AbstractSessionService } from './abstract.session.service';
import { map, Observable, shareReplay } from 'rxjs';
import { Session, SessionContainer } from '../api/session-element';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionService implements AbstractSessionService {
  private dataCache: Map<number, Observable<Session>> | undefined;
  public constructor(private http: HttpClient) {}

  updateSession$(session: Session): Observable<Session> {
    return this.http.post<Session>(`${environment.sessionEndpointUrl}?overwrite=true`, session);
  }

  sessionData$(year: number): Observable<Session> {
    if (!this.dataCache) {
      this.dataCache = new Map<number, Observable<Session>>();
    }

    if (!this.dataCache.has(year)) {
      const request$ = this.http
        .get<SessionContainer>(`${environment.sessionEndpointUrl}?year=${year}`)
        .pipe(
          map((container: SessionContainer) => container.Value),
          shareReplay(1)
        );

      this.dataCache.set(year, request$);
    }

    return this.dataCache.get(year)!;
  }
}
