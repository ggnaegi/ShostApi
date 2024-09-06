import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AbstractSessionService} from "./session/services/abstract.session.service";
import {SessionService} from "./session/services/session.service";
import {provideHttpClient} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes), provideAnimationsAsync(), {
    provide: AbstractSessionService,
    useClass: SessionService
  },
    provideHttpClient(),]
};
