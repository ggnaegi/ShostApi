import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractLayoutService } from '../services/abstract.layout.service';
import { WelcomePageDto } from '../api/layout.models';
import { AsyncPipe } from '@angular/common';
import { WelcomeComponent } from '../pages/welcome/welcome.component';

@Component({
  selector: 'app-welcome-container',
  template: `<app-welcome [data]="welcome$ | async"></app-welcome>`,
  standalone: true,
  imports: [AsyncPipe, WelcomeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeContainerComponent {
  welcome$: Observable<WelcomePageDto>;

  constructor(
    private layoutService: AbstractLayoutService,
  ) {
    this.welcome$ = this.layoutService.welcomePageData$();
  }
}
