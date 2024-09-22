import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SessionComponent } from '../pages/session.component';
import { AbstractSessionService } from '../services/abstract.session.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-session-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SessionComponent, AsyncPipe],
  template: `
    <app-session
      [sessionData]="sessionService.sessionData$(this.year, false) | async" />
  `,
})
export class SessionContainerComponent implements OnInit {
  year = 2024;

  constructor(
    public readonly sessionService: AbstractSessionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.year = +params['year'];
    });
  }
}
