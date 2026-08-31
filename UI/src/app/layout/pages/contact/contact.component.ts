import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { EmailData } from '../../../about/api/organisation';
import { ContactPageDto } from '../../api/layout.models';

@Component({
  selector: 'app-contact',
  imports: [
    FlexModule,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormField,
    MatInput,
    MatLabel,
  ],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  readonly data = input<ContactPageDto | null>(null);

  readonly formSubmitted = output<EmailData>();

  submitForm(contactForm: NgForm): void {
    if (contactForm.valid) {
      const emailData = {} as EmailData;
      emailData.FirstName = contactForm.value.firstName;
      emailData.LastName = contactForm.value.lastName;
      emailData.Email = contactForm.value.email;
      emailData.Phone = contactForm.value.phone;
      emailData.Message = contactForm.value.message;
      emailData.RecaptchaResponse = '';

      this.formSubmitted.emit(emailData);
    }
  }
}
