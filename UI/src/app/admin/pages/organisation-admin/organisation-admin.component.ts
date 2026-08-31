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
import { Organisation } from '../../../about/api/organisation';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout';
import { MatInput } from '@angular/material/input';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';

import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-organisation-admin',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatCheckbox,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    FlexModule,
    MatInput,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanel,
    MatOption,
    MatSelect,
  ],
  templateUrl: './organisation-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './organisation-admin.component.css',
})
export class OrganisationAdminComponent implements OnInit, OnChanges {
  readonly organisationData = input<Organisation | null>(null);

  readonly yearChanged = output<number>();

  readonly organisationSubmitted = output<Organisation>();

  bandForm!: FormGroup;
  years: number[] = [];
  selectedYear?: number;

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let year = 1999; year <= currentYear + 1; year++) {
      this.years.push(year);
    }

    this.bandForm = this.fb.group({
      Year: [null, Validators.required],
      WelcomeText: ['', [Validators.required, Validators.maxLength(4000)]],
      ContactPersonText: ['', [Validators.maxLength(255)]],
      BandPicture: ['', [Validators.maxLength(255)]],
      BandTitle: ['', [Validators.required, Validators.maxLength(255)]],
      BandPresentation: [
        '',
        [Validators.required, Validators.maxLength(10000)],
      ],
      CommitteePicture: ['', [Validators.maxLength(255)]],
      CommitteeTitle: ['', [Validators.required, Validators.maxLength(255)]],
      CommitteePresentation: [
        '',
        [Validators.required, Validators.maxLength(10000)],
      ],
      CommitteeMembers: this.fb.array([]),
      Sponsors: this.fb.array([]),
    });

    const organisationData = this.organisationData();
    if (organisationData) {
      this.populateBandForm(organisationData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['organisationData']?.currentValue) {
      const currentValue = changes['organisationData'].currentValue;
      this.populateBandForm(
        currentValue === 'Organisation not found.'
          ? ({ Year: this.selectedYear } as Organisation)
          : (currentValue as Organisation)
      );
    }
  }

  updateYear(event: MatSelectChange): void {
    this.selectedYear = event.value;
    this.yearChanged.emit(this.selectedYear!);
  }

  get CommitteeMembers() {
    return this.bandForm.get('CommitteeMembers') as FormArray;
  }

  public addCommitteeMember(): void {
    this.CommitteeMembers.push(
      this.fb.group({
        Function: ['', [Validators.required, Validators.maxLength(255)]],
        FirstName: ['', [Validators.required, Validators.maxLength(100)]],
        LastName: ['', [Validators.required, Validators.maxLength(100)]],
        Address: ['', [Validators.maxLength(255)]],
        Zip: ['', [Validators.maxLength(10)]],
        City: ['', [Validators.maxLength(255)]],
        PhoneNumber: ['', [Validators.maxLength(20)]],
        Email: ['', [Validators.email, Validators.maxLength(255)]],
        Presentation: ['', [Validators.maxLength(4000)]],
        Picture: ['', [Validators.maxLength(255)]],
        IsContactPerson: [false],
      })
    );
  }

  public removeCommitteeMember(index: number): void {
    this.CommitteeMembers.removeAt(index);
  }

  onSubmit() {
    if (this.bandForm.valid) {
      const updatedBandData = this.bandForm.value as Organisation;
      this.organisationSubmitted.emit(updatedBandData);
    }
  }

  private populateBandForm(bandData: Organisation): void {
    if (!this.bandForm) {
      return;
    }
    // Patch the main form controls
    this.bandForm.patchValue({
      Year: bandData.Year,
      WelcomeText: bandData.WelcomeText,
      ContactPersonText: bandData.ContactPersonText,
      BandPicture: bandData.BandPicture,
      BandTitle: bandData.BandTitle,
      BandPresentation: bandData.BandPresentation,
      CommitteePicture: bandData.CommitteePicture,
      CommitteeTitle: bandData.CommitteeTitle,
      CommitteePresentation: bandData.CommitteePresentation,
    });

    // Clear the existing committee members
    this.CommitteeMembers.clear();

    // Populate committee members if available
    bandData.CommitteeMembers?.forEach(member => {
      this.CommitteeMembers.push(
        this.fb.group({
          Function: [member.Function, [Validators.maxLength(255)]],
          FirstName: [member.FirstName, [Validators.maxLength(100)]],
          LastName: [member.LastName, [Validators.maxLength(100)]],
          Address: [member.Address, [Validators.maxLength(255)]],
          Zip: [member.Zip, [Validators.maxLength(10)]],
          City: [member.City, [Validators.maxLength(255)]],
          PhoneNumber: [member.PhoneNumber, [Validators.maxLength(20)]],
          Email: [member.Email, [Validators.email, Validators.maxLength(255)]],
          Presentation: [member.Presentation, [Validators.maxLength(4000)]],
          Picture: [member.Picture, [Validators.maxLength(255)]],
          IsContactPerson: [member.IsContactPerson],
        })
      );
    });
  }
}
