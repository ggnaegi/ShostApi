import {
  Component,
  Input,
} from '@angular/core';
import { WelcomePageDto } from '../../api/layout.models';
import {
  DatePipe,
  NgForOf,
  NgIf,
} from '@angular/common';
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
  standalone: true,
  imports: [
    NgIf,
    ImageWithLoadingComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    DatePipe,
    FaIconComponent,
    MatButton,
    MatCardContent,
    NgForOf
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  @Input()
  data: WelcomePageDto | null = null;

  year = 2025;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faMapMarkerAlt = faMapMarkerAlt;
  protected readonly faBuilding = faBuilding;
  protected readonly faTicket = faTicket;
}
