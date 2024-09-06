import {Component, Input} from '@angular/core';
import {Session} from "../api/session-element";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FlexModule} from "@angular/flex-layout";
import {Register, RegisterMusician} from "../api/parsed-session-element";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {FaIconComponent, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { faTicket, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import {MatButton} from "@angular/material/button";


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
    MatButton
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent {
  @Input()
  sessionData: Session | null = null;

  faTicket = faTicket;
  faCalendarAlt = faCalendarAlt;
  faMapMarkerAlt = faMapMarkerAlt;

  /**
   * Retrieving registers,
   * grouping musicians by register
   */
  public getRegisters(): Register[] {
    if(!this.sessionData?.Musicians){
      return [];
    }

    const registerMap: { [key: string]: RegisterMusician[] } = {};

    this.sessionData.Musicians.forEach((musician) => {
      const { Instrument, FirstName, LastName } = musician;
      if (Instrument) {
        if (!registerMap[Instrument]) {
          registerMap[Instrument] = [];
        }
        registerMap[Instrument].push({ FirstName, LastName });
      }
    });

    return Object.keys(registerMap).map((instrument) => ({
      RegisterName: instrument,
      RegisterMusicians: registerMap[instrument],
    }));

  }
}
