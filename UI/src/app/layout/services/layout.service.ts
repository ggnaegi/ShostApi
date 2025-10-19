import { AbstractLayoutService } from './abstract.layout.service';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import {
  WelcomePageDto,
  AboutPageDto,
  ContactPageDto,
} from '../api/layout.models';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { statusCodeChecker } from '../../utils/StatusCodeChecker';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LayoutService implements AbstractLayoutService {
  constructor(private http: HttpClient) {}

  public welcomePageData$(): Observable<WelcomePageDto> {
    return this.http
      .get<WelcomePageDto>(`${environment.apiBaseUrl}/welcome-page`)
      .pipe(
        shareReplay(1),
        catchError((error: HttpErrorResponse) => {
          statusCodeChecker(error.status);
          return throwError(() => error);
        })
      );
  }

  public aboutPageData$(): Observable<AboutPageDto> {
    return this.http
      .get<AboutPageDto>(`${environment.apiBaseUrl}/about-page`)
      .pipe(
        shareReplay(1),
        catchError((error: HttpErrorResponse) => {
          statusCodeChecker(error.status);
          return throwError(() => error);
        })
      );
  }

  public contactPageData$(): Observable<ContactPageDto> {
    return this.http
      .get<ContactPageDto>(`${environment.apiBaseUrl}/contact-page`)
      .pipe(
        shareReplay(1),
        catchError((error: HttpErrorResponse) => {
          statusCodeChecker(error.status);
          return throwError(() => error);
        })
      );
  }
}
