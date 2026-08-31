import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ContactComponent } from '../pages/contact/contact.component';
import { EmailData } from '../../about/api/organisation';
import { RecaptchaService } from '../../about/services/recaptcha.service';
import { environment } from '../../../environments/environment';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-contact-container',
  template: `<app-contact
    [data]="appDataStore.contactPage()"
    (formSubmitted)="sendEmail($event)"></app-contact>`,
  imports: [ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactContainerComponent implements OnInit {
  public readonly appDataStore = inject(AppDataStore);
  private readonly recaptchaService = inject(RecaptchaService);

  ngOnInit(): void {
    this.recaptchaService.load(environment.recaptchaClientKey);
    this.appDataStore.loadContactPage();
  }

  public sendEmail(email: EmailData): void {
    this.recaptchaService.execute('sendEmail', result => {
      email.RecaptchaResponse = result;
      this.appDataStore.sendEmail(email);
    });
  }
}
