import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
} from '@angular/core';
import { Session } from '../api/session-element';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ExtendedModule, FlexModule } from '@angular/flex-layout';
import { Register, RegisterMusician } from '../api/parsed-session-element';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {
  FaIconComponent,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faTicket,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ImageWithLoadingComponent } from '../../common/image-with-loading.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    NgIf,
    FlexModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    NgForOf,
    FaIconComponent,
    DatePipe,
    FontAwesomeModule,
    MatButton,
    ExtendedModule,
    MatIcon,
    MatIconButton,
    MatToolbar,
    MatAnchor,
    RouterLink,
    MatProgressSpinner,
    ImageWithLoadingComponent,
    MatTooltip,
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionComponent implements OnDestroy {
  @Input()
  sessionData: Session | null = null;

  faTicket = faTicket;
  faCalendarAlt = faCalendarAlt;
  faMapMarkerAlt = faMapMarkerAlt;
  faBuilding = faBuilding;

  isMobile: boolean = window.innerWidth <= 768;
  isFloatingMenuVisible = false; // Controls the visibility of the menu
  private scrollTimeout: any;

  public constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Retrieving registers,
   * grouping musicians by register
   */
  public getRegisters(): Register[] {
    if (!this.sessionData?.Musicians) {
      return [];
    }

    const registerMap: Record<string, RegisterMusician[]> = {};

    this.sessionData.Musicians.forEach(musician => {
      const { Instrument, FirstName, LastName } = musician;
      if (Instrument) {
        if (!registerMap[Instrument]) {
          registerMap[Instrument] = [];
        }
        registerMap[Instrument].push({ FirstName, LastName });
      }
    });

    return Object.keys(registerMap).map(instrument => ({
      RegisterName: instrument,
      RegisterMusicians: registerMap[instrument],
    }));
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isFloatingMenuVisible = true;

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isFloatingMenuVisible = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}
