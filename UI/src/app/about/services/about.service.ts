import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AbstractAboutService } from './abstract.about.service';
import { Organisation, Sponsor } from '../api/organisation';

@Injectable({
  providedIn: 'root',
})
export class AboutService implements AbstractAboutService {
  private sponsors = 'assets/sponsors/sponsors-config.json';
  private organisation = 'assets/organisation.json';

  private sponsors$: Observable<Sponsor[]> | undefined;
  private organisation$: Observable<Organisation> | undefined;


  constructor(private http: HttpClient) {}

  getSponsors$(): Observable<Sponsor[]> | undefined {
    if(!this.sponsors$) {
      this.sponsors$ = this.http.get<Sponsor[]>(this.sponsors).pipe(shareReplay());
    }
    return this.sponsors$;
  }

  getAboutDefinition$(): Observable<Organisation> {
    if(!this.organisation$){
      this.organisation$ = this.http.get<Organisation>(this.organisation).pipe(shareReplay());
    }
    return this.organisation$;
  }
}
