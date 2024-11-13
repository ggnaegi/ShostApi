import { Injectable } from '@angular/core';
import { AbstractSessionService } from './abstract.session.service';
import { map, Observable, shareReplay, take, tap } from 'rxjs';
import { Session, SessionContainer } from '../api/session-element';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { statusCodeChecker } from '../../utils/StatusCodeChecker';

@Injectable({
  providedIn: 'root',
})
export class SessionService implements AbstractSessionService {
  private dataCache: Map<number, Observable<Session>> | undefined;
  public constructor(private http: HttpClient) {}

  updateSession(session: Session): void {
    const year = session.Year;

    this.http
      .post<SessionContainer>(
        `${environment.sessionEndpointUrl}?overwrite=true`,
        session,
        { withCredentials: true }
      )
      .pipe(
        take<SessionContainer>(1),
        map<SessionContainer, Session>(container => {
          const statusCode = container.StatusCode;
          statusCodeChecker(statusCode);
          return container.Value;
        }),
        tap<Session>(updatedSession => {
          if (this.dataCache) {
            this.dataCache.set(
              year,
              new Observable(observer => {
                observer.next(updatedSession);
                observer.complete();
              })
            );
          }
        }),
        shareReplay<Session>(1)
      )
      .subscribe();
  }

  sessionData$(year: number, adminRoute: boolean): Observable<Session> {
    if (!this.dataCache) {
      this.dataCache = new Map<number, Observable<Session>>();
    }

    const requestOptions = adminRoute ? { withCredentials: true } : {};
    if (!this.dataCache.has(year)) {
      const request$ = this.http
        .get<SessionContainer>(
          `${environment.sessionEndpointUrl}${adminRoute ? '/admin' : '/user'}?year=${year}`,
          requestOptions
        )
        .pipe(
          map((container: SessionContainer) => {
            const statusCode = container.StatusCode;
            statusCodeChecker(statusCode);
            return container.Value;
          }),
          shareReplay(1)
        );

      this.dataCache.set(year, request$);
    }

    return this.dataCache.get(year)!;
  }
}
