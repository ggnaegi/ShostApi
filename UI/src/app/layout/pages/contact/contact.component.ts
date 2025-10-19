import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { NgIf } from '@angular/common';
import { EmailData } from '../../../about/api/organisation';
import { ContactPageDto } from '../../api/layout.models';

@Component({
  selector: 'app-contact',
  standalone: true,
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
    NgIf,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  @Input()
  data: ContactPageDto | null = null;

  @Output()
  formSubmitted = new EventEmitter<EmailData>();

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
