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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

import { SponsorsConfig } from '../../../about/api/organisation';
import { SponsorsTexts } from '../../api/sponsors-admin.service';

@Component({
  selector: 'app-sponsors-admin',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    FlexModule,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
  ],
  templateUrl: './sponsors-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrl: './sponsors-admin.component.css',
})
export class SponsorsAdminComponent implements OnInit, OnChanges {
  readonly sponsorsConfig = input<SponsorsConfig | null>(null);

  readonly logosBusy = input(false);

  readonly textsSubmitted = output<SponsorsTexts>();

  readonly logosUploaded = output<File[]>();

  readonly logoDeleted = output<string>();

  textsForm!: FormGroup;

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.textsForm = this.fb.group({
      BenefactorsTitle: ['', [Validators.maxLength(255)]],
      BenefactorsBody: [''],
      SponsorsTitle: ['', [Validators.maxLength(255)]],
      SponsorsBody: [''],
    });

    const config = this.sponsorsConfig();
    if (config) {
      this.populateForm(config);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sponsorsConfig']?.currentValue && this.textsForm) {
      this.populateForm(
        changes['sponsorsConfig'].currentValue as SponsorsConfig
      );
    }
  }

  get logos() {
    return this.sponsorsConfig()?.sponsorsLogos ?? [];
  }

  onSubmit(): void {
    if (this.textsForm.valid) {
      const value = this.textsForm.value;
      this.textsSubmitted.emit({
        benefactorsTitle: value.BenefactorsTitle ?? '',
        benefactorsBody: value.BenefactorsBody ?? '',
        sponsorsTitle: value.SponsorsTitle ?? '',
        sponsorsBody: value.SponsorsBody ?? '',
      });
    }
  }

  onLogoFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length > 0) {
      this.logosUploaded.emit(files);
    }
    input.value = '';
  }

  deleteLogo(filename: string): void {
    this.logoDeleted.emit(filename);
  }

  private populateForm(config: SponsorsConfig): void {
    this.textsForm.patchValue({
      BenefactorsTitle: config.benefactorsTitle ?? '',
      BenefactorsBody: config.benefactorsBody ?? '',
      SponsorsTitle: config.sponsorsTitle ?? '',
      SponsorsBody: config.sponsorsBody ?? '',
    });
  }
}
