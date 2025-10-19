import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AbstractLayoutService } from '../services/abstract.layout.service';
import { ContactPageDto } from '../api/layout.models';
import { AsyncPipe } from '@angular/common';
import { ContactComponent } from '../pages/contact/contact.component';
import { EmailData, EmailSendResult } from '../../about/api/organisation';
import { AbstractAboutService } from '../../about/services/abstract.about.service';
import { RecaptchaService } from '../../about/services/recaptcha.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact-container',
  template: `<app-contact
    [data]="contact$ | async"
    (formSubmitted)="sendEmail($event)"></app-contact>`,
  standalone: true,
  imports: [AsyncPipe, ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactContainerComponent implements OnDestroy, OnInit {
  contact$: Observable<ContactPageDto>;

  constructor(
    private layoutService: AbstractLayoutService,
    public readonly aboutService: AbstractAboutService,
    private recaptchaService: RecaptchaService,
    private cdr: ChangeDetectorRef
  ) {
    this.contact$ = this.layoutService.contactPageData$();
  }

  private sendEmailSubscription: Subscription | undefined;
  public emailSendResult: EmailSendResult | undefined = undefined;

  ngOnDestroy(): void {
    if (this.sendEmailSubscription) {
      this.sendEmailSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.recaptchaService.load(environment.recaptchaClientKey);
  }

  public sendEmail(email: EmailData): void {
    if (this.sendEmailSubscription) {
      this.sendEmailSubscription.unsubscribe();
    }
    this.recaptchaService.execute('sendEmail', result => {
      email.RecaptchaResponse = result;
      this.sendEmailSubscription = this.aboutService
        .sendEmail$(email)
        .subscribe({
          next: () => {
            this.emailSendResult = {
              message: 'Votre message a été transmis avec succès!',
              success: true,
            } as EmailSendResult;
            this.cdr.markForCheck();
            this.hideOverlayAfterDelay();
          },
          error: () => {
            this.emailSendResult = {
              message:
                "Une erreur est survenue lors de l'envoi du message, veuillez réessayer plus tard.",
              success: false,
            } as EmailSendResult;
            this.cdr.markForCheck();
            this.hideOverlayAfterDelay();
          },
        });
    });
  }

  private hideOverlayAfterDelay(): void {
    setTimeout(() => {
      this.emailSendResult = undefined;
      this.cdr.markForCheck();
    }, 2000);
  }
}
