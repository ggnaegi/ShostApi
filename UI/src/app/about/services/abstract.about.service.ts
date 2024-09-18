import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Organisation, Sponsor } from '../api/organisation';

@Injectable()
export abstract class AbstractAboutService {
  abstract getAboutDefinition$(): Observable<Organisation>;
  abstract getSponsors$(): Observable<Sponsor[]>;
}
