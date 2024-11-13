import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Session } from '../../../session/api/session-element';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
} from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { FlexModule } from '@angular/flex-layout';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

@Component({
  selector: 'app-session-admin',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatButton,
    NgForOf,
    MatIconButton,
    MatIcon,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatLabel,
    MatGridList,
    MatGridTile,
    MatSelect,
    MatOption,
    MatNativeDateModule,
    FlexModule,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    NgIf,
  ],
  templateUrl: './session-admin.component.html',
  styleUrl: './session-admin.component.css',
})
export class SessionAdminComponent implements OnInit, OnChanges {
  @Input()
  sessionData: Session | null = null;

  @Output()
  yearChanged = new EventEmitter<number>();

  @Output()
  sessionSubmitted = new EventEmitter<Session>();

  sessionForm!: FormGroup;
  years: number[] = [];
  selectedYear?: number;

  constructor(private fb: FormBuilder) {}

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

    if (this.sessionData) {
      this.populateForm(this.sessionData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionData'] && changes['sessionData'].currentValue) {
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
    this.yearChanged.emit(this.selectedYear);
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
