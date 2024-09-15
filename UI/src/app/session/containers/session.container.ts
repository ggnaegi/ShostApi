import {Component, OnInit} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {SessionComponent} from "../pages/session.component";
import {AbstractSessionService} from "../services/abstract.session.service";
import {Observable} from "rxjs";
import {Session} from "../api/session-element";
import {ActivatedRoute} from "@angular/router";

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
export class SessionContainerComponent implements OnInit {
  year: number = 2024;

  sessionData$!: Observable<Session>;

  constructor(public sessionService: AbstractSessionService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.year = +params['year']; // The '+' converts 'year' from string to number
      this.sessionData$ = this.sessionService.sessionData$(this.year);
    });
  }
}
