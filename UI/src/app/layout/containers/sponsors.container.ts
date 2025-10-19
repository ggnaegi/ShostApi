import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AbstractAboutService } from '../../about/services/abstract.about.service';
import { Sponsor } from '../../about/api/organisation';
import { SponsorsComponent } from '../pages/sponsors/sponsors.component';

@Component({
  selector: 'app-sponsors-container',
  template: `<app-sponsors [data]="sponsors$ | async"></app-sponsors>`,
  standalone: true,
  imports: [AsyncPipe, SponsorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsorsContainerComponent {
   sponsors$: Observable<Sponsor[]> | undefined;

  constructor(
    private aboutService: AbstractAboutService
  ) {
    this.sponsors$ = this.aboutService.getSponsors$();
  }
}
