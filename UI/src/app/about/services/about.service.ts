import {Injectable} from "@angular/core";
import {map, Observable, shareReplay} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AbstractAboutService} from "./abstract.about.service";
import {Organisation, OrganisationContainer, Sponsor} from "../api/organisation";

@Injectable({
  providedIn: 'root'
})
export class AboutService implements AbstractAboutService {

  private sponsors = 'assets/sponsors/sponsors_config.json';

  constructor(private http: HttpClient) {
  }

  getSponsors$(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.sponsors);
  }

  getAboutDefinition$(): Observable<Organisation> {
    return this.http.get<OrganisationContainer>(`http://localhost:7227/api/organisations`)
      .pipe(
        map(result => result.Value),
        shareReplay())
  }
}
