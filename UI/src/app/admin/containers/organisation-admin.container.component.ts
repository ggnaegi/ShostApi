import { AsyncPipe } from '@angular/common';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { SessionAdminComponent } from '../pages/session-admin/session-admin.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractAboutService } from '../../about/services/abstract.about.service';
import { Organisation } from '../../about/api/organisation';
import { OrganisationAdminComponent } from '../pages/organisation-admin/organisation-admin.component';

@Component({
  selector: 'app-organisation-admin-container',
  standalone: true,
  imports: [
    AsyncPipe,
    OrganisationAdminComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <app-organisation-admin
    [organisationData]="aboutService.getAboutDefinitionForYear$(year) | async"
    (yearChanged)="updateYear($event)"
    (organisationSubmitted)="updateOrganisation($event)">
  </app-organisation-admin>`,
})
export class OrganisationAdminContainerComponent {
  year = 2025;

  constructor(public readonly aboutService: AbstractAboutService) {}

  public updateYear(year: number): void {
    this.year = year;
  }

  async updateOrganisation(organisation: Organisation) {
    this.aboutService.updateAbout(organisation);
  }
}
