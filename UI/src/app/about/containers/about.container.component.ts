import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AboutComponent } from '../pages/about.component';
import { RecaptchaService } from '../services/recaptcha.service';
import { EmailData } from '../api/organisation';
import { EmailOverlayComponent } from '../pages/email.overlay.component';
import { environment } from '../../../environments/environment';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-about-container',
  standalone: true,
  imports: [AboutComponent, EmailOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-about
      [organisation]="appDataStore.organisation()"
      [sponsors]="appDataStore.sponsors()"
      (formSubmitted)="sendEmail($event)" />
    <app-email-overlay [result]="appDataStore.emailSendResult()"></app-email-overlay>
  `,
})
export class AboutContainerComponent implements OnInit {
  public readonly appDataStore = inject(AppDataStore);
  private readonly recaptchaService = inject(RecaptchaService);

  ngOnInit(): void {
    this.recaptchaService.load(environment.recaptchaClientKey);
    this.appDataStore.loadOrganisation();
    this.appDataStore.loadSponsors();
  }

  public sendEmail(email: EmailData): void {
    this.recaptchaService.execute('sendEmail', result => {
      email.RecaptchaResponse = result;
      this.appDataStore.sendEmail(email);
    });
  }
}
