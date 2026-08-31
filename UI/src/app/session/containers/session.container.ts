import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { SessionComponent } from '../pages/session.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-session-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SessionComponent],
  template: `
    <app-session
      [sessionData]="sessionData()"
      [organisationData]="organisation()"
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class SessionContainerComponent implements OnInit {
  // default year, if not set in route
  protected readonly year = signal(2026);

  private readonly appDataStore = inject(AppDataStore);

  protected readonly organisation = this.appDataStore.organisation;
  protected readonly sessionData = this.appDataStore.sessionForYear(this.year);

  ngOnInit(): void {
    this.appDataStore.loadOrganisation();
    this.appDataStore.loadSession({ year: this.year(), adminRoute: false });
  }

  onYearChanged(year: number): void {
    this.year.set(year);
    this.appDataStore.loadSession({ year, adminRoute: false });
  }
}
