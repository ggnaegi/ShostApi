import {Injectable} from "@angular/core";
import {AbstractSessionService} from "./abstract.session.service";
import {Observable, shareReplay} from "rxjs";
import {Session} from "../api/session-element";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements AbstractSessionService {
  public constructor(private http: HttpClient) {}

  sessionData$(year: number): Observable<Session> {
    return this.http.get<Session>(`assets/${year}/session.json`)
      .pipe(shareReplay())
  }
}
