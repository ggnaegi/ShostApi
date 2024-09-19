import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges,
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
import { CommitteeMember, EmailData, Organisation, Sponsor } from '../api/organisation';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    GalleryContainerComponent,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardImage,
    MatCardTitle,
    FlexModule,
    NgIf,
    NgForOf,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    MatProgressSpinner,
    NgClass,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, OnChanges {
  @Input()
  organisation: Organisation | null = null;

  @Input()
  sponsors: Sponsor[] | null = null;

  @Output()
  formSubmitted = new EventEmitter<EmailData>();

  president: CommitteeMember | undefined;

  constructor(private route: ActivatedRoute) {}

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
      let emailData = {} as EmailData;
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
    if (!this.organisation?.CommitteeMembers) {
      return;
    }

    this.president = this.organisation.CommitteeMembers.find(
      (x) => x.IsContactPerson,
    );
  }
}
