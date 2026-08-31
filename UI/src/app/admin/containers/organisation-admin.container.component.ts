import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
  protected readonly year = signal(2025);

  private readonly appDataStore = inject(AppDataStore);

  protected readonly organisationData = this.appDataStore.organisationForYear(
    this.year
  );

  ngOnInit(): void {
    this.appDataStore.loadOrganisationForYear(this.year());
  }

  public updateYear(year: number): void {
    this.year.set(year);
    this.appDataStore.loadOrganisationForYear(year);
  }

  public updateOrganisation(organisation: Organisation): void {
    this.appDataStore.updateOrganisation(organisation);
  }
}
