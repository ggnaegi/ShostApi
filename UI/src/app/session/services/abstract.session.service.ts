import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Session, SessionSummary} from "../api/session-element";


@Injectable()
export abstract class AbstractSessionService {
  abstract sessionSummaries$(): Observable<SessionSummary>;
  abstract sessionData$(year: number): Observable<Session>
}
