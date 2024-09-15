import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Organisation} from "../api/organisation";


@Injectable()
export abstract class AbstractAboutService {
  abstract getAboutDefinition$(): Observable<Organisation>;
}
