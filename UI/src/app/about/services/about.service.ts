import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AbstractAboutService } from './abstract.about.service';
import { Organisation, Sponsor } from '../api/organisation';

@Injectable({
  providedIn: 'root',
})
export class AboutService implements AbstractAboutService {
  private sponsors = 'assets/sponsors/sponsors_config.json';
  private organisation = 'assets/organisation.json';

  constructor(private http: HttpClient) {}

  getSponsors$(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.sponsors);
  }

  getAboutDefinition$(): Observable<Organisation> {
    return this.http.get<Organisation>(this.organisation).pipe(shareReplay());
  }
}
