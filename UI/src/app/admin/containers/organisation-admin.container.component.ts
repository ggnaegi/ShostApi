import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Organisation } from '../../about/api/organisation';
import { OrganisationAdminComponent } from '../pages/organisation-admin/organisation-admin.component';
import { AppDataStore } from '../../store/app-data/app-data.store';

@Component({
  selector: 'app-organisation-admin-container',
  imports: [OrganisationAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <app-organisation-admin
    [organisationData]="organisationData()"
    (yearChanged)="updateYear($event)"
    (organisationSubmitted)="updateOrganisation($event)">
  </app-organisation-admin>`,
})
export class OrganisationAdminContainerComponent implements OnInit {
  year = 2025;

  public readonly appDataStore = inject(AppDataStore);

  public organisationData(): Organisation | null {
    return this.appDataStore.organisationsByYear()[this.year] ?? null;
  }

  ngOnInit(): void {
    this.appDataStore.loadOrganisationForYear(this.year);
  }

  public updateYear(year: number): void {
    this.year = year;
    this.appDataStore.loadOrganisationForYear(this.year);
  }

  public updateOrganisation(organisation: Organisation): void {
    this.appDataStore.updateOrganisation(organisation);
  }
}
