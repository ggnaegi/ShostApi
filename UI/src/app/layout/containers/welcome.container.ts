import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { WelcomeComponent } from '../pages/welcome/welcome.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-welcome-container',
  template: `<app-welcome [data]="welcomePage()"></app-welcome>`,
  imports: [WelcomeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeContainerComponent implements OnInit {
  private readonly appDataStore = inject(AppDataStore);

  protected readonly welcomePage = this.appDataStore.welcomePage;

  ngOnInit(): void {
    this.appDataStore.loadWelcomePage();
  }
}
