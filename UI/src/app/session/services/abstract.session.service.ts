import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Session} from "../api/session-element";


@Injectable()
export abstract class AbstractSessionService {
  abstract sessionData$(year: number): Observable<Session>
}
