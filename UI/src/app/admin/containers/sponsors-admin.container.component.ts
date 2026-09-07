import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { SponsorsAdminComponent } from '../pages/sponsors-admin/sponsors-admin.component';
import { AppDataStore } from '../../store/app-data/app-data.store';
import {
  SponsorsAdminService,
  SponsorsTexts,
} from '../api/sponsors-admin.service';

@Component({
  selector: 'app-sponsors-admin-container',
  imports: [SponsorsAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sponsors-admin
      [sponsorsConfig]="sponsorsConfig()"
      [logosBusy]="logosBusy()"
      (textsSubmitted)="saveTexts($event)"
      (logosUploaded)="uploadLogos($event)"
      (logoDeleted)="deleteLogo($event)"></app-sponsors-admin>
  `,
})
export class SponsorsAdminContainerComponent implements OnInit {
  protected readonly logosBusy = signal(false);

  private readonly appDataStore = inject(AppDataStore);
  private readonly sponsorsAdminService = inject(SponsorsAdminService);

  protected readonly sponsorsConfig = this.appDataStore.sponsorsConfig;

  ngOnInit(): void {
    this.appDataStore.loadSponsors();
  }

  public saveTexts(texts: SponsorsTexts): void {
    this.sponsorsAdminService
      .saveTexts(texts)
      .subscribe(config => this.appDataStore.setSponsorsConfig(config));
  }

  public uploadLogos(files: File[]): void {
    this.logosBusy.set(true);
    this.sponsorsAdminService
      .uploadLogos(files)
      .pipe(finalize(() => this.logosBusy.set(false)))
      .subscribe(config => this.appDataStore.setSponsorsConfig(config));
  }

  public deleteLogo(filename: string): void {
    this.logosBusy.set(true);
    this.sponsorsAdminService
      .deleteLogos([filename])
      .pipe(finalize(() => this.logosBusy.set(false)))
      .subscribe(config => this.appDataStore.setSponsorsConfig(config));
  }
}
