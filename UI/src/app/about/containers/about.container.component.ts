import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AboutComponent } from '../pages/about.component';
import { AbstractAboutService } from '../services/abstract.about.service';

@Component({
  selector: 'app-gallery-container',
  standalone: true,
  imports: [AboutComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-about
      [organisation]="aboutService.getAboutDefinition$() | async"
      [sponsors]="aboutService.getSponsors$() | async"
    />
  `,
})
export class AboutContainerComponent {
  constructor(public readonly aboutService: AbstractAboutService) {}
}
