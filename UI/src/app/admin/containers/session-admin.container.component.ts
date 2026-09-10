import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { SessionAdminComponent } from '../pages/session-admin/session-admin.component';
import { AppDataStore } from '../../store/app-data/app-data.store';
import { Session } from '../../session/api/session-element';

@Component({
    selector: 'app-session-admin-container',
    imports: [SessionAdminComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <app-session-admin
      [sessionData]="sessionData()"
      [years]="years()"
      (yearChanged)="updateYear($event)"
      (sessionSubmitted)="updateSession($event)"></app-session-admin>
  `
})
export class SessionAdminContainerComponent implements OnInit {
  protected readonly year = signal<number | null>(null);

  private readonly appDataStore = inject(AppDataStore);

  protected readonly years = computed(() =>
    (this.appDataStore.galleryDefinition()?.logos ?? [])
      .map(logo => logo.year)
      .sort((a, b) => b - a)
  );
  protected readonly sessionData = this.appDataStore.sessionForYear(
    computed(() => this.year() ?? 0)
  );

  private readonly initialSessionEffect = effect(() => {
    const [firstYear] = this.years();
    if (firstYear && this.year() === null) {
      this.updateYear(firstYear);
    }
  });

  ngOnInit(): void {
    this.appDataStore.loadGalleryDefinition();
  }

  public updateYear(year: number): void {
    this.year.set(year);
    this.appDataStore.loadSession({ year, adminRoute: true });
  }

  public updateSession(session: Session) {
    this.appDataStore.updateSession(session);
  }
}
