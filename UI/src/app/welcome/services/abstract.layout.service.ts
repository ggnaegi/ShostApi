import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AboutPageDto, WelcomePageDto } from '../api/layout.models';

@Injectable()
export abstract class AbstractLayoutService {
  abstract welcomePageData$(): Observable<WelcomePageDto>;
  abstract aboutPageData$(): Observable<AboutPageDto>;
}
