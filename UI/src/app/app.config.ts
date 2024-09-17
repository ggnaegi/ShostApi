import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  withInMemoryScrolling
} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AbstractSessionService} from "./session/services/abstract.session.service";
import {SessionService} from "./session/services/session.service";
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AbstractGalleryService} from "./gallery/services/abstract.gallery.service";
import {GalleryService} from "./gallery/services/gallery.service";
import {AbstractAboutService} from "./about/services/abstract.about.service";
import {AboutService} from "./about/services/about.service";
import {SpinnerInterceptor} from "./spinner/interceptors/spinner.interceptor";
import {SpinnerService} from "./spinner/services/spinner.service";

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes, inMemoryScrollingFeature), provideAnimationsAsync(), {
    provide: AbstractSessionService,
    useClass: SessionService
  },
  {
    provide: AbstractGalleryService,
    useClass: GalleryService
  },
  {
    provide: AbstractAboutService,
    useClass: AboutService
  },
  SpinnerService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: SpinnerInterceptor,
    multi: true
  },
  provideHttpClient(withInterceptorsFromDi())]
};
