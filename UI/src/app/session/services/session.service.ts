import { Injectable } from '@angular/core';
import { AbstractSessionService } from './abstract.session.service';
import { Observable, shareReplay } from 'rxjs';
import { Session } from '../api/session-element';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SessionService implements AbstractSessionService {
  private dataCache: Map<number, Observable<Session>> | undefined;
  public constructor(private http: HttpClient) {}

  sessionData$(year: number): Observable<Session> {
    if (!this.dataCache) {
      this.dataCache = new Map<number, Observable<Session>>();
    }

    if (!this.dataCache.has(year)) {
      const request$ = this.http
        .get<Session>(`assets/${year}/session.json`)
        .pipe(shareReplay(1));

      this.dataCache.set(year, request$);
    }

    return this.dataCache.get(year)!;
  }
}
