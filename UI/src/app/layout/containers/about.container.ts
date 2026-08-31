import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AboutComponent } from '../pages/about/about.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-about-container',
  template: `<app-about [data]="appDataStore.aboutPage()"></app-about>`,
  imports: [AboutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutContainerComponent implements OnInit {
  public readonly appDataStore = inject(AppDataStore);

  ngOnInit(): void {
    this.appDataStore.loadAboutPage();
  }
}
