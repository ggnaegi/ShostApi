import {Injectable} from "@angular/core";
import {AbstractSessionService} from "./abstract.session.service";
import {map, Observable, shareReplay} from "rxjs";
import {Session, SessionContainer} from "../api/session-element";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements AbstractSessionService {
  public constructor(private http: HttpClient) {}

  sessionData$(year: number): Observable<Session> {
    return this.http.get<SessionContainer>(`http://localhost:7227/api/sessions?year=${year}`)
      .pipe(
        map(result => result.Value),
          shareReplay())
  }
}
