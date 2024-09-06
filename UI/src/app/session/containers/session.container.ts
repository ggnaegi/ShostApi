import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {SessionComponent} from "../pages/session.component";
import {AbstractSessionService} from "../services/abstract.session.service";
import {Observable} from "rxjs";
import {Session} from "../api/session-element";

@Component({
  selector: 'app-session-container',
  standalone: true,
  imports: [
    SessionComponent,
    AsyncPipe
  ],
  template: `
    <app-session [sessionData]="sessionData$ | async"/>
  `
})
export class SessionContainerComponent implements OnChanges {
  @Input()
  year: number = 2024;

  sessionData$!: Observable<Session>;

  constructor(public sessionService: AbstractSessionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // If 'year' changes, re-fetch the session data
    if (changes["year"]) {
      this.sessionData$ = this.sessionService.sessionData$(this.year);
    }
  }
}
