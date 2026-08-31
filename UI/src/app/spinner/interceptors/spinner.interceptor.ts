import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent, HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  private readonly loadingService = inject(SpinnerService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.loadingService.hide();
        }
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}
