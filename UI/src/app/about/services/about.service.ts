import {Injectable} from "@angular/core";
import {map, Observable, shareReplay} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AbstractAboutService} from "./abstract.about.service";
import {Organisation, OrganisationContainer} from "../api/organisation";

@Injectable({
  providedIn: 'root'
})
export class AboutService implements AbstractAboutService {
  constructor(private http: HttpClient) {
  }

  getAboutDefinition$(): Observable<Organisation> {
    return this.http.get<OrganisationContainer>(`http://localhost:7227/api/organisations`)
      .pipe(
        map(result => result.Value),
        shareReplay())
  }
}
