import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailData, Organisation, Sponsor } from '../api/organisation';

@Injectable()
export abstract class AbstractAboutService {
  abstract getAboutDefinition$(): Observable<Organisation>;
  abstract getAboutDefinitionForYear$(year: number): Observable<Organisation>;
  abstract getSponsors$(): Observable<Sponsor[]> | undefined;
  abstract updateAbout(Organisation: Organisation): void;
  abstract sendEmail$(email: EmailData): Observable<any>;
}
