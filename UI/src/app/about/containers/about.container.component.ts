import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AboutComponent } from '../pages/about.component';
import { AbstractAboutService } from '../services/abstract.about.service';
import { RecaptchaService } from '../services/recaptcha.service';
import { EmailData, EmailSendResult } from '../api/organisation';
import { Subscription } from 'rxjs';
import { EmailOverlayComponent } from '../pages/email.overlay.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about-container',
  standalone: true,
  imports: [AboutComponent, AsyncPipe, NgIf, EmailOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-about
      [organisation]="aboutService.getAboutDefinition$() | async"
      [sponsors]="aboutService.getSponsors$() | async"
      (formSubmitted)="sendEmail($event)" />
    <app-email-overlay [result]="emailSendResult"></app-email-overlay>
  `,
})
export class AboutContainerComponent implements OnInit, OnDestroy {
  private sendEmailSubscription: Subscription | undefined;
  public emailSendResult: EmailSendResult | undefined = undefined;

  constructor(
    public readonly aboutService: AbstractAboutService,
    private recaptchaService: RecaptchaService,
    private cdr: ChangeDetectorRef
  ) {}

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
