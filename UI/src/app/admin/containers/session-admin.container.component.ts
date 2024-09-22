import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { SessionAdminComponent } from '../pages/session-admin/session-admin.component';
import { AbstractSessionService } from '../../session/services/abstract.session.service';
import { AsyncPipe } from '@angular/common';
import { Session } from '../../session/api/session-element';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-session-admin-container',
  standalone: true,
  imports: [MatTab, MatTabGroup, MatTabLabel, SessionAdminComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-session-admin
      [sessionData]="sessionService.sessionData$(year, true) | async"
      (yearChanged)="updateYear($event)"
      (sessionSubmitted)="updateSessionAsync($event)"></app-session-admin>
  `,
})
export class SessionAdminContainerComponent {
  year = 2025;

  constructor(
    public readonly sessionService: AbstractSessionService,
  ) {}

  public updateYear(year: number): void {
    this.year = year;
  }

  async updateSessionAsync(session: Session) {
    try {
      const updatedSession = await firstValueFrom(this.sessionService.updateSession$(session));
      console.log('Session updated successfully:', updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }
}
