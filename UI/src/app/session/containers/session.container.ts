import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SessionComponent } from '../pages/session.component';
import { AbstractSessionService } from '../services/abstract.session.service';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-session-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SessionComponent, AsyncPipe],
  template: `
    <app-session
      [sessionData]="sessionService.sessionData$(this.year, false) | async"
      [organisationData]="appDataStore.organisation()"
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class SessionContainerComponent implements OnInit {
  // default year, if not set in route
  year = 2026;

  public readonly sessionService = inject(AbstractSessionService);
  public readonly appDataStore = inject(AppDataStore);

  ngOnInit(): void {
    this.appDataStore.loadOrganisation();
  }

  onYearChanged(year: number): void {
    this.year = year;
  }
}
