import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AboutComponent } from '../pages/about/about.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-about-container',
  template: `<app-about [data]="aboutPage()"></app-about>`,
  imports: [AboutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutContainerComponent implements OnInit {
  private readonly appDataStore = inject(AppDataStore);

  protected readonly aboutPage = this.appDataStore.aboutPage;

  ngOnInit(): void {
    this.appDataStore.loadAboutPage();
  }
}
