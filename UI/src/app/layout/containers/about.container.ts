import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractLayoutService } from '../services/abstract.layout.service';
import { AboutPageDto } from '../api/layout.models';
import { AsyncPipe } from '@angular/common';
import { AboutComponent } from '../pages/about/about.component';

@Component({
  selector: 'app-about-container',
  template: `<app-about [data]="about$ | async"></app-about>`,
  standalone: true,
  imports: [AsyncPipe, AboutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutContainerComponent {
  about$: Observable<AboutPageDto>;

  constructor(private layoutService: AbstractLayoutService) {
    this.about$ = this.layoutService.aboutPageData$();
  }
}
