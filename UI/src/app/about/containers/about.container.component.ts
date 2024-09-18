import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AboutComponent } from '../pages/about.component';
import { AbstractAboutService } from '../services/abstract.about.service';
import { Organisation, Sponsor } from '../api/organisation';

@Component({
  selector: 'app-gallery-container',
  standalone: true,
  imports: [AboutComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-about
      [organisation]="organisation$ | async"
      [sponsors]="sponsors$ | async"
    />
  `,
})
export class AboutContainerComponent implements OnInit {
  organisation$!: Observable<Organisation>;
  sponsors$!: Observable<Sponsor[]>;

  constructor(public aboutService: AbstractAboutService) {}

  ngOnInit(): void {
    this.organisation$ = this.aboutService.getAboutDefinition$();
    this.sponsors$ = this.aboutService.getSponsors$();
  }
}
