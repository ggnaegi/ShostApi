import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailData, Organisation, Sponsor } from '../api/organisation';

@Injectable()
export abstract class AbstractAboutService {
  abstract getAboutDefinition$(): Observable<Organisation>;
  abstract getSponsors$(): Observable<Sponsor[]> | undefined;
  abstract sendEmail$(email: EmailData): Observable<any>;
}
