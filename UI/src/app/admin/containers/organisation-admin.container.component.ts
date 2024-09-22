import { AsyncPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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
    MatTab,
    MatTabGroup,
    MatTabLabel,
    SessionAdminComponent,
    AsyncPipe,
    OrganisationAdminComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-organisation-admin
      [organisationData]="aboutService.getAboutDefinitionForYear$(year) | async"
      (yearChanged)="updateYear($event)"
      (organisationSubmitted)="
        updateOrganisationAsync($event)
      "></app-organisation-admin>
  `,
})
export class OrganisationAdminContainerComponent {
  year = 2025;

  constructor(public readonly aboutService: AbstractAboutService) {}

  public updateYear(year: number): void {
    this.year = year;
  }

  async updateOrganisationAsync(organisation: Organisation) {
    try {
      const updateOrganisation = await firstValueFrom(
        this.aboutService.updateAbout$(organisation)
      );
      console.log('Session updated successfully:', updateOrganisation);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }
}
