import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { SpinnerInterceptor } from './spinner/interceptors/spinner.interceptor';
import { SpinnerService } from './spinner/services/spinner.service';
import { RecaptchaService } from './about/services/recaptcha.service';
import { FbSdkService } from './layout/services/fb-sdk.service';
import { provideStore } from '@ngrx/store';
import { spinnerFeatureKey, spinnerReducer } from './spinner/store/spinner.reducer';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, inMemoryScrollingFeature),
    provideAnimationsAsync(),
    SpinnerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
    RecaptchaService,
    FbSdkService,
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideStore({
      [spinnerFeatureKey]: spinnerReducer,
    }),
  ],
};
