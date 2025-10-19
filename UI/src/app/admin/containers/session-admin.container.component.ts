import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SessionAdminComponent } from '../pages/session-admin/session-admin.component';
import { AbstractSessionService } from '../../session/services/abstract.session.service';
import { AsyncPipe } from '@angular/common';
import { Session } from '../../session/api/session-element';

@Component({
  selector: 'app-session-admin-container',
  standalone: true,
  imports: [SessionAdminComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-session-admin
      [sessionData]="sessionService.sessionData$(year, true) | async"
      (yearChanged)="updateYear($event)"
      (sessionSubmitted)="updateSession($event)"></app-session-admin>
  `,
})
export class SessionAdminContainerComponent {
  year = 2026;

  constructor(public readonly sessionService: AbstractSessionService) {}

  public updateYear(year: number): void {
    this.year = year;
  }

  public updateSession(session: Session) {
    this.sessionService.updateSession(session);
  }
}
