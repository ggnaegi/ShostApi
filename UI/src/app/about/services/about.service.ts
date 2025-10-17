import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AbstractAboutService } from './abstract.about.service';
import {
  EmailData,
  Organisation,
  OrganisationContainer,
  Sponsor,
} from '../api/organisation';
import { environment } from '../../../environments/environment';
import { statusCodeChecker } from '../../utils/StatusCodeChecker';

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
        .get<OrganisationContainer>(
          `${environment.organisationEndpointUrl}/${year}`,
          { withCredentials: true }
        )
        .pipe(
          map((container: OrganisationContainer) => {
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

  updateAbout(organisation: Organisation): void {
    const year = organisation.Year;

    this.http
      .post<OrganisationContainer>(
        `${environment.organisationEndpointUrl}?overwrite=true`,
        organisation,
        { withCredentials: true }
      )
      .pipe(
        take<OrganisationContainer>(1),
        map<OrganisationContainer, Organisation>(container => {
          const statusCode = container.StatusCode;
          statusCodeChecker(statusCode);
          return container.Value;
        }),
        tap<Organisation>(updatedOrganisation => {
          if (this.dataCache) {
            this.dataCache.set(
              year,
              new Observable(observer => {
                observer.next(updatedOrganisation);
                observer.complete();
              })
            );
          }
        }),
        shareReplay<Organisation>(1)
      )
      .subscribe();
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
        .get<OrganisationContainer>(environment.organisationEndpointUrl, { withCredentials: true })
        .pipe(
          map((container: OrganisationContainer) => container.Value),
          shareReplay(1)
        );
    }
    return this.organisation$;
  }
}
