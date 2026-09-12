import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionComponent } from '../pages/session.component';
import { AppDataStore } from '../../store/app-data/app-data.store';
import { Session, SessionContainer } from '../api/session-element';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-session-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SessionComponent],
  template: `
    <app-session
      [sessionData]="sessionData()"
      [organisationData]="organisation()"
      [availableYears]="availableYears()"
      [flyerUrl]="flyerUrl()"
      [hasPublishedGallery]="hasPublishedGallery()"
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class SessionContainerComponent implements OnInit {
  // default year, if not set in route
  protected readonly year = signal(2026);

  private readonly appDataStore = inject(AppDataStore);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly organisation = this.appDataStore.organisation;
  protected readonly sessionData = this.appDataStore.sessionForYear(this.year);
  protected readonly flyerUrl = computed(
    () =>
      this.appDataStore
        .galleryDefinition()
        ?.logos.find(logo => logo.year === this.year())?.url ?? ''
  );
  protected readonly availableYears = computed(() =>
    (this.appDataStore.galleryDefinition()?.logos ?? [])
      .filter(logo => logo.showPage)
      .map(logo => logo.year)
      .sort((a, b) => b - a)
  );
  protected readonly hasPublishedGallery = computed(
    () =>
      this.appDataStore
        .galleryDefinition()
        ?.logos.some(
          logo => logo.year === this.year() && logo.showGallery
        ) ?? false
  );

  ngOnInit(): void {
    this.appDataStore.loadOrganisation();
    this.appDataStore.loadGalleryDefinition();
    this.route.paramMap.subscribe(params => {
      const year = Number(params.get('year'));
      const isSessionArticle = Number.isInteger(year) && year > 0;

      if (isSessionArticle) {
        this.year.set(year);
        this.appDataStore.loadSession({ year, adminRoute: false });
        return;
      }

      this.http
        .get<Session | SessionContainer>(environment.sessionEndpointUrl)
        .subscribe(response => {
          const session = 'Value' in response ? response.Value : response;
          this.year.set(session.Year);
          this.appDataStore.loadSession({
            year: session.Year,
            adminRoute: false,
          });
        });
    });
  }

  onYearChanged(year: number): void {
    void this.router.navigate(['/session', year]);
  }
}
