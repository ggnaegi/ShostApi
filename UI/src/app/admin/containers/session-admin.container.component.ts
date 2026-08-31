import {
  ChangeDetectionStrategy,
  Component,
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
      (yearChanged)="updateYear($event)"
      (sessionSubmitted)="updateSession($event)"></app-session-admin>
  `
})
export class SessionAdminContainerComponent implements OnInit {
  protected readonly year = signal(2026);

  private readonly appDataStore = inject(AppDataStore);

  protected readonly sessionData = this.appDataStore.sessionForYear(this.year);

  ngOnInit(): void {
    this.appDataStore.loadSession({ year: this.year(), adminRoute: true });
  }

  public updateYear(year: number): void {
    this.year.set(year);
    this.appDataStore.loadSession({ year, adminRoute: true });
  }

  public updateSession(session: Session) {
    this.appDataStore.updateSession(session);
  }
}
