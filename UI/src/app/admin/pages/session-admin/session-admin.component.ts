import {
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { Session } from '../../../session/api/session-element';
import { Image } from '../../../gallery/api/gallery';
import { PortraitAdminService } from '../../../gallery/api/portrait-admin.service';
import { finalize } from 'rxjs';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
} from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FlexModule } from '@angular/flex-layout';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

@Component({
  selector: 'app-session-admin',
  imports: [
    MatFormField,
    MatSuffix,
    MatInput,
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatLabel,
    MatSelect,
    MatOption,
    MatNativeDateModule,
    FlexModule,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatProgressSpinner,
  ],
  templateUrl: './session-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './session-admin.component.css',
})
export class SessionAdminComponent implements OnInit, OnChanges {
  readonly sessionData = input<Session | null>(null);

  readonly galleryImages = input<Image[]>([]);

  readonly galleryBusy = input(false);

  readonly yearChanged = output<number>();

  readonly sessionSubmitted = output<Session>();

  readonly imagesUploaded = output<File[]>();

  readonly imageDeleted = output<string>();

  sessionForm!: FormGroup;
  years: number[] = [];
  selectedYear?: number;

  conductorPortraitBusy = false;
  private readonly soloistPortraitBusy = new Set<number>();

  private readonly fb = inject(FormBuilder);
  private readonly portraitService = inject(PortraitAdminService);

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let year = 1999; year <= currentYear + 1; year++) {
      this.years.push(year);
    }

    this.sessionForm = this.fb.group({
      Year: ['', Validators.required],
      Title: ['', [Validators.required, Validators.maxLength(100)]],
      Presentation: ['', [Validators.required, Validators.maxLength(4000)]],
      Program: ['', [Validators.required, Validators.maxLength(2000)]],
      Teaser: ['', [Validators.required, Validators.maxLength(3000)]],
      Picture: ['', [Validators.maxLength(255)]],
      Gallery: ['', [Validators.maxLength(255)]],
      Conductor: this.fb.group({
        FirstName: ['', [Validators.maxLength(100)]],
        LastName: ['', [Validators.maxLength(100)]],
        Presentation: ['', [Validators.maxLength(4000)]],
        Picture: ['', [Validators.maxLength(255)]],
      }),
      Soloists: this.fb.array([]),
      Musicians: this.fb.array([]),
      Concerts: this.fb.array([]),
    });

    const sessionData = this.sessionData();
    if (sessionData) {
      this.populateForm(sessionData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionData']?.currentValue) {
      const currentValue = changes['sessionData'].currentValue;
      this.populateForm(
        currentValue === 'Session not found.'
          ? ({ Year: this.selectedYear } as Session)
          : (currentValue as Session)
      );
    }
  }

  updateYear(event: MatSelectChange): void {
    this.selectedYear = event.value;
    this.yearChanged.emit(this.selectedYear!);
  }

  public get Soloists() {
    return this.sessionForm.get('Soloists') as FormArray;
  }

  public get Musicians() {
    return this.sessionForm.get('Musicians') as FormArray;
  }

  public get Concerts() {
    return this.sessionForm.get('Concerts') as FormArray;
  }

  public addSoloist(): void {
    this.Soloists.push(
      this.fb.group({
        FirstName: ['', [Validators.maxLength(100)]],
        LastName: ['', [Validators.maxLength(100)]],
        Instrument: ['', [Validators.maxLength(100)]],
        Presentation: ['', [Validators.maxLength(4000)]],
        Picture: ['', [Validators.maxLength(255)]],
      })
    );
  }

  public addMusician(): void {
    this.Musicians.push(
      this.fb.group({
        FirstName: ['', [Validators.maxLength(100)]],
        LastName: ['', [Validators.maxLength(100)]],
        Instrument: ['', [Validators.maxLength(100)]],
      })
    );
  }

  public addConcert(): void {
    this.Concerts.push(
      this.fb.group({
        Date: ['', Validators.required],
        Venue: ['', [Validators.maxLength(255)]],
        City: ['', [Validators.maxLength(255)]],
        Tickets: ['', [Validators.maxLength(255)]],
      })
    );
  }

  public removeSoloist(index: number): void {
    this.Soloists.removeAt(index);
  }

  public removeMusician(index: number): void {
    this.Musicians.removeAt(index);
  }

  public removeConcert(index: number): void {
    this.Concerts.removeAt(index);
  }

  onSubmit() {
    if (this.sessionForm.valid) {
      const updatedSessionValue = this.sessionForm.value as Session;
      this.sessionSubmitted.emit(updatedSessionValue);
    }
  }

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length > 0) {
      this.imagesUploaded.emit(files);
    }
    input.value = '';
  }

  deleteGalleryImage(url: string): void {
    this.imageDeleted.emit(url);
  }

  isSoloistPortraitBusy(index: number): boolean {
    return this.soloistPortraitBusy.has(index);
  }

  onConductorPortraitSelected(event: Event): void {
    const file = this.extractFile(event);
    const year = this.currentYear();
    if (!file || !year) {
      return;
    }

    const control = this.sessionForm.get('Conductor.Picture');
    const directory = `${year}/Gallery/Conductor`;

    this.conductorPortraitBusy = true;
    this.portraitService
      .uploadPortrait(directory, file, control?.value || undefined)
      .pipe(finalize(() => (this.conductorPortraitBusy = false)))
      .subscribe(path => this.applyPortraitPath(control, path));
  }

  onSoloistPortraitSelected(event: Event, index: number): void {
    const file = this.extractFile(event);
    const year = this.currentYear();
    if (!file || !year) {
      return;
    }

    const control = this.Soloists.at(index).get('Picture');
    const directory = `${year}/Gallery/Soloists`;

    this.soloistPortraitBusy.add(index);
    this.portraitService
      .uploadPortrait(directory, file, control?.value || undefined)
      .pipe(finalize(() => this.soloistPortraitBusy.delete(index)))
      .subscribe(path => this.applyPortraitPath(control, path));
  }

  private applyPortraitPath(
    control: ReturnType<FormGroup['get']>,
    path: string
  ): void {
    control?.setValue(path);
    control?.markAsDirty();
    this.sessionForm.markAsDirty();
  }

  private extractFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    return file;
  }

  private currentYear(): number | null {
    return this.sessionForm.get('Year')?.value ?? this.selectedYear ?? null;
  }

  private populateForm(sessionData: Session): void {
    this.sessionForm.patchValue({
      Year: sessionData.Year,
      Title: sessionData.Title,
      Presentation: sessionData.Presentation,
      Program: sessionData.Program,
      Teaser: sessionData.Teaser,
      Picture: sessionData.Picture,
      Gallery: sessionData.Gallery,
      Conductor: sessionData.Conductor
        ? {
            FirstName: sessionData.Conductor.FirstName,
            LastName: sessionData.Conductor.LastName,
            Presentation: sessionData.Conductor.Presentation,
            Picture: sessionData.Conductor.Picture,
          }
        : {
            FirstName: null,
            LastName: null,
            Presentation: null,
            Picture: null,
          },
    });

    this.Soloists.clear();
    sessionData.Soloists?.forEach(soloist => {
      this.Soloists.push(
        this.fb.group({
          FirstName: [soloist.FirstName, [Validators.maxLength(100)]],
          LastName: [soloist.LastName, [Validators.maxLength(100)]],
          Instrument: [soloist.Instrument, [Validators.maxLength(100)]],
          Presentation: [soloist.Presentation, [Validators.maxLength(4000)]],
          Picture: [soloist.Picture, [Validators.maxLength(255)]],
        })
      );
    });

    this.Musicians.clear();
    sessionData.Musicians?.forEach(musician => {
      this.Musicians.push(
        this.fb.group({
          FirstName: [musician.FirstName, [Validators.maxLength(100)]],
          LastName: [musician.LastName, [Validators.maxLength(100)]],
          Instrument: [musician.Instrument, [Validators.maxLength(100)]],
        })
      );
    });

    this.Concerts.clear();
    sessionData.Concerts?.forEach(concert => {
      this.Concerts.push(
        this.fb.group({
          Date: [concert.Date, Validators.required],
          Venue: [concert.Venue, [Validators.maxLength(255)]],
          City: [concert.City, [Validators.maxLength(255)]],
          Tickets: [concert.Tickets, [Validators.maxLength(255)]],
        })
      );
    });
  }
}
