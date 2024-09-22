import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AbstractAboutService } from './abstract.about.service';
import { EmailData, Organisation, OrganisationContainer, Sponsor } from '../api/organisation';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AboutService implements AbstractAboutService {
  private sponsors = 'assets/sponsors/sponsors-config.json';

  private sponsors$: Observable<Sponsor[]> | undefined;
  private organisation$: Observable<Organisation> | undefined;
  private dataCache: Map<number, Observable<Organisation>> | undefined;

  constructor(private http: HttpClient) {}

  getAboutDefinitionForYear$(year: number): Observable<Organisation> {
    if (!this.dataCache) {
      this.dataCache = new Map<number, Observable<Organisation>>();
    }

    if (!this.dataCache.has(year)) {
      const request$ = this.http
        .get<OrganisationContainer>(`${environment.organisationEndpointUrl}/${year}`)
        .pipe(
          map((container: OrganisationContainer) => container.Value),
          shareReplay(1)
        );

      this.dataCache.set(year, request$);
    }

    return this.dataCache.get(year)!;
  }

  updateAbout$(organisation: Organisation): Observable<Organisation> {
    return this.http.post<Organisation>(
      `${environment.organisationEndpointUrl}?overwrite=true`,
      organisation
    );
  }

  sendEmail$(email: EmailData): Observable<any> {
    return this.http.post(environment.sendMessageEndpointUrl, email);
  }

  getSponsors$(): Observable<Sponsor[]> | undefined {
    if (!this.sponsors$) {
      this.sponsors$ = this.http
        .get<Sponsor[]>(this.sponsors)
        .pipe(shareReplay());
    }
    return this.sponsors$;
  }

  getAboutDefinition$(): Observable<Organisation> {
    if (!this.organisation$) {
      this.organisation$ = this.http
        .get<OrganisationContainer>(environment.organisationEndpointUrl)
        .pipe(
          map((container: OrganisationContainer) => container.Value),
          shareReplay(1)
        );
    }
    return this.organisation$;
  }
}
