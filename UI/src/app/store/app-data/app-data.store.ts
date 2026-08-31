import { computed, inject, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, pipe, switchMap, tap } from 'rxjs';
import {
  EmailData,
  EmailSendResult,
  Organisation,
  OrganisationContainer,
  Sponsor,
} from '../../about/api/organisation';
import { GalleriesDefinition } from '../../gallery/api/gallery';
import {
  AboutPageDto,
  ContactPageDto,
  WelcomePageDto,
} from '../../layout/api/layout.models';
import { Session, SessionContainer } from '../../session/api/session-element';
import { environment } from '../../../environments/environment';
import { statusCodeChecker } from '../../utils/StatusCodeChecker';

const EMAIL_RESULT_DISPLAY_DURATION_MS = 2000;

export interface AppDataState {
  organisation: Organisation | null;
  organisationsByYear: Record<number, Organisation>;
  sponsors: Sponsor[] | null;
  galleryDefinition: GalleriesDefinition | null;
  welcomePage: WelcomePageDto | null;
  aboutPage: AboutPageDto | null;
  contactPage: ContactPageDto | null;
  emailSendResult: EmailSendResult | null;
  sessionsByYear: Record<number, Session>;
}

const initialState: AppDataState = {
  organisation: null,
  organisationsByYear: {},
  sponsors: null,
  galleryDefinition: null,
  welcomePage: null,
  aboutPage: null,
  contactPage: null,
  emailSendResult: null,
  sessionsByYear: {},
};

const sponsorsUrl = 'assets/sponsors/sponsors-config.json';
const galleryConfigUrl = 'assets/galleries/gallery-config.json';

export const AppDataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    /** Loads the current (undated) organisation definition, used for the public about/session pages. */
    loadOrganisation: rxMethod<void>(
      pipe(
        filter(() => !store.organisation()),
        switchMap(() =>
          http
            .get<OrganisationContainer>(environment.organisationEndpointUrl, {
              withCredentials: true,
            })
            .pipe(
              tap(container => {
                statusCodeChecker(container.StatusCode);
                patchState(store, { organisation: container.Value });
              }),
              catchError(() => EMPTY)
            )
        )
      )
    ),

    /** Loads the organisation definition for a specific year, used for the admin page. */
    loadOrganisationForYear: rxMethod<number>(
      pipe(
        filter(year => !store.organisationsByYear()[year]),
        switchMap(year =>
          http
            .get<OrganisationContainer>(
              `${environment.organisationEndpointUrl}/${year}`,
              { withCredentials: true }
            )
            .pipe(
              tap(container => {
                statusCodeChecker(container.StatusCode);
                patchState(store, {
                  organisationsByYear: {
                    ...store.organisationsByYear(),
                    [year]: container.Value,
                  },
                });
              }),
              catchError(() => EMPTY)
            )
        )
      )
    ),

    /** Persists an updated organisation definition and refreshes the per-year cache. */
    updateOrganisation: rxMethod<Organisation>(
      pipe(
        switchMap(organisation =>
          http
            .post<OrganisationContainer>(
              `${environment.organisationEndpointUrl}?overwrite=true`,
              organisation,
              { withCredentials: true }
            )
            .pipe(
              tap(container => {
                statusCodeChecker(container.StatusCode);
                patchState(store, {
                  organisationsByYear: {
                    ...store.organisationsByYear(),
                    [container.Value.Year]: container.Value,
                  },
                });
              }),
              catchError(() => EMPTY)
            )
        )
      )
    ),

    /** Custom selector: the cached organisation for a given (reactive) year. */
    organisationForYear(year: Signal<number>): Signal<Organisation | null> {
      return computed(() => store.organisationsByYear()[year()] ?? null);
    },

    loadSponsors: rxMethod<void>(
      pipe(
        filter(() => !store.sponsors()),
        switchMap(() =>
          http.get<Sponsor[]>(sponsorsUrl).pipe(
            tap(sponsors => patchState(store, { sponsors })),
            catchError(() => EMPTY)
          )
        )
      )
    ),

    /** Sends the contact email and exposes a transient success/error result to the caller. */
    sendEmail: rxMethod<EmailData>(
      pipe(
        switchMap(email =>
          http.post(environment.sendMessageEndpointUrl, email).pipe(
            tap(() => {
              patchState(store, {
                emailSendResult: {
                  message: 'Votre message a été transmis avec succès!',
                  success: true,
                },
              });
              setTimeout(() => {
                patchState(store, { emailSendResult: null });
              }, EMAIL_RESULT_DISPLAY_DURATION_MS);
            }),
            catchError(() => {
              patchState(store, {
                emailSendResult: {
                  message:
                    "Une erreur est survenue lors de l'envoi du message, veuillez réessayer plus tard.",
                  success: false,
                },
              });
              setTimeout(() => {
                patchState(store, { emailSendResult: null });
              }, EMAIL_RESULT_DISPLAY_DURATION_MS);
              return EMPTY;
            })
          )
        )
      )
    ),

    loadGalleryDefinition: rxMethod<void>(
      pipe(
        filter(() => !store.galleryDefinition()),
        switchMap(() =>
          http.get<GalleriesDefinition>(galleryConfigUrl).pipe(
            tap(galleryDefinition => patchState(store, { galleryDefinition })),
            catchError(() => EMPTY)
          )
        )
      )
    ),

    loadWelcomePage: rxMethod<void>(
      pipe(
        filter(() => !store.welcomePage()),
        switchMap(() =>
          http
            .get<WelcomePageDto>(`${environment.apiBaseUrl}/welcome-page`)
            .pipe(
              tap(welcomePage => patchState(store, { welcomePage })),
              catchError((error: HttpErrorResponse) => {
                statusCodeChecker(error.status);
                return EMPTY;
              })
            )
        )
      )
    ),

    loadAboutPage: rxMethod<void>(
      pipe(
        filter(() => !store.aboutPage()),
        switchMap(() =>
          http.get<AboutPageDto>(`${environment.apiBaseUrl}/about-page`).pipe(
            tap(aboutPage => patchState(store, { aboutPage })),
            catchError((error: HttpErrorResponse) => {
              statusCodeChecker(error.status);
              return EMPTY;
            })
          )
        )
      )
    ),

    loadContactPage: rxMethod<void>(
      pipe(
        filter(() => !store.contactPage()),
        switchMap(() =>
          http
            .get<ContactPageDto>(`${environment.apiBaseUrl}/contact-page`)
            .pipe(
              tap(contactPage => patchState(store, { contactPage })),
              catchError((error: HttpErrorResponse) => {
                statusCodeChecker(error.status);
                return EMPTY;
              })
            )
        )
      )
    ),

    /** Loads the session for a given year, using the public or admin endpoint. */
    loadSession: rxMethod<{ year: number; adminRoute: boolean }>(
      pipe(
        filter(({ year }) => !store.sessionsByYear()[year]),
        switchMap(({ year, adminRoute }) => {
          // Admin route keeps the global spinner; the public session page
          // shows a skeleton instead while the session data is loading.
          const requestOptions = adminRoute ? { withCredentials: true } : {};
          const endpoint = adminRoute
            ? environment.sessionAdminEndpointUrl
            : environment.sessionEndpointUrl;

          return http
            .get<SessionContainer>(`${endpoint}/${year}`, requestOptions)
            .pipe(
              tap(container => {
                statusCodeChecker(container.StatusCode);
                patchState(store, {
                  sessionsByYear: {
                    ...store.sessionsByYear(),
                    [year]: container.Value,
                  },
                });
              }),
              catchError(() => EMPTY)
            );
        })
      )
    ),

    /** Persists an updated session and refreshes the per-year cache. */
    updateSession: rxMethod<Session>(
      pipe(
        switchMap(session =>
          http
            .post<SessionContainer>(
              `${environment.sessionEndpointUrl}?overwrite=true`,
              session,
              { withCredentials: true }
            )
            .pipe(
              tap(container => {
                statusCodeChecker(container.StatusCode);
                patchState(store, {
                  sessionsByYear: {
                    ...store.sessionsByYear(),
                    [container.Value.Year]: container.Value,
                  },
                });
              }),
              catchError(() => EMPTY)
            )
        )
      )
    ),

    /** Custom selector: the cached session for a given (reactive) year. */
    sessionForYear(year: Signal<number>): Signal<Session | null> {
      return computed(() => store.sessionsByYear()[year()] ?? null);
    },
  }))
);
