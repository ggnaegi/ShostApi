import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { WelcomePageDto } from '../../api/layout.models';
import { DatePipe } from '@angular/common';
import { ImageWithLoadingComponent } from '../../../common/image-with-loading.component';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatButton } from '@angular/material/button';
import {
  faBuilding,
  faCalendarAlt,
  faMapMarkerAlt,
  faTicket,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-welcome',
  imports: [
    ImageWithLoadingComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    DatePipe,
    FaIconComponent,
    MatButton,
    MatCardContent,
  ],
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  readonly data = input<WelcomePageDto | null>(null);

  year = 2026;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faMapMarkerAlt = faMapMarkerAlt;
  protected readonly faBuilding = faBuilding;
  protected readonly faTicket = faTicket;
}
