import {Component, OnInit} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {Observable} from "rxjs";
import {AboutComponent} from "../pages/about.component";
import {AbstractAboutService} from "../services/abstract.about.service";
import {Organisation} from "../api/organisation";

@Component({
  selector: 'app-gallery-container',
  standalone: true,
  imports: [
    AboutComponent,
    AsyncPipe
  ],
  template: `
    <app-about [organisation]="organisation$ | async"/>
  `
})
export class AboutContainerComponent implements OnInit {
  organisation$!: Observable<Organisation>;

  constructor(public aboutService: AbstractAboutService) {
  }

  ngOnInit(): void {
    this.organisation$ = this.aboutService.getAboutDefinition$();
  }
}
