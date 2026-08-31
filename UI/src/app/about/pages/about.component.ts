import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
  input,
  output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryContainerComponent } from '../../gallery/container/gallery.container.component';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardTitle,
} from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import {
  CommitteeMember,
  EmailData,
  Organisation,
  Sponsor,
} from '../api/organisation';

import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-about',
  imports: [
    GalleryContainerComponent,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardImage,
    MatCardTitle,
    FlexModule,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, OnChanges {
  readonly organisation = input<Organisation | null>(null);

  readonly sponsors = input<Sponsor[] | null>(null);

  readonly formSubmitted = output<EmailData>();

  president: CommitteeMember | undefined;

  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment: string | null) => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setPresident();
  }

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

  private setPresident(): void {
    const organisation = this.organisation();
    if (!organisation?.CommitteeMembers) {
      return;
    }

    this.president = organisation.CommitteeMembers.find(x => x.IsContactPerson);
  }
}
