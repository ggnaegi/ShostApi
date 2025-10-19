import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SessionComponent } from '../pages/session.component';
import { AbstractSessionService } from '../services/abstract.session.service';
import { AbstractAboutService } from '../../about/services/abstract.about.service';

@Component({
  selector: 'app-session-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SessionComponent, AsyncPipe],
  template: `
    <app-session
      [sessionData]="sessionService.sessionData$(this.year, false) | async"
      [organisationData]="aboutService.getAboutDefinition$() | async"
      (yearChanged)="onYearChanged($event)" />
  `,
})
export class SessionContainerComponent {
  // default year, if not set in route
  year = 2026;

  constructor(
    public readonly sessionService: AbstractSessionService,
    public readonly aboutService: AbstractAboutService
  ) {}

  onYearChanged(year: number): void {
    this.year = year;
  }
}
