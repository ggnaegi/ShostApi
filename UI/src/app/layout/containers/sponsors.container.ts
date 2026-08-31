import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SponsorsComponent } from '../pages/sponsors/sponsors.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-sponsors-container',
  template: `<app-sponsors [data]="appDataStore.sponsors()"></app-sponsors>`,
  imports: [SponsorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsorsContainerComponent implements OnInit {
  public readonly appDataStore = inject(AppDataStore);

  ngOnInit(): void {
    this.appDataStore.loadSponsors();
  }
}
