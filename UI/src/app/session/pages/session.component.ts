import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
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
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ImageWithLoadingComponent } from '../../common/image-with-loading.component';
import { MatTooltip } from '@angular/material/tooltip';
import { GalleryContainerComponent } from '../../gallery/container/gallery.container.component';
import { Organisation } from '../../about/api/organisation';

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
    RouterLink,
    ImageWithLoadingComponent,
    MatTooltip,
    GalleryContainerComponent,
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionComponent implements OnDestroy {
  @Input()
  sessionData: Session | null = null;

  @Input()
  organisationData: Organisation | null = null;

  @Output()
  yearChanged = new EventEmitter<number>();

  faTicket = faTicket;
  faCalendarAlt = faCalendarAlt;
  faMapMarkerAlt = faMapMarkerAlt;
  faBuilding = faBuilding;

  isMobile: boolean = window.innerWidth <= 768;
  isFloatingMenuVisible = false; // Controls the visibility of the menu
  private scrollTimeout: any;

  mobileSelectedYear = 2026;

  public constructor(private cdr: ChangeDetectorRef) {}

  public onYearChanged(year: number) {
    this.yearChanged.emit(year);
  }

  public onMobileSelectedYear(year: number) {
    this.mobileSelectedYear = year;
    this.yearChanged.emit(year);
  }

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

  /**
   * Distributes complete registers across three groups,
   * ensuring musicians of the same instrument stay together
   */
  getRegisterGroups(): {
    left: Register[];
    center: Register[];
    right: Register[];
  } {
    const registers = this.getRegisters();
    const groups: { left: Register[]; center: Register[]; right: Register[] } =
      {
        left: [],
        center: [],
        right: [],
      };

    registers.forEach((register, index) => {
      const groupIndex = index % 3;
      if (groupIndex === 0) {
        groups.left.push(register);
      } else if (groupIndex === 1) {
        groups.center.push(register);
      } else {
        groups.right.push(register);
      }
    });

    return groups;
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
