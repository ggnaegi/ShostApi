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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FlexModule } from '@angular/flex-layout';

import { GalleryAdminItem } from '../../../gallery/api/gallery';
import { GalleryLogoInput } from '../../../gallery/api/gallery-admin.service';

@Component({
  selector: 'app-gallery-item-admin',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSlideToggle,
    FlexModule,
  ],
  templateUrl: './gallery-item-admin.component.html',
  styleUrl: './gallery-item-admin.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GalleryItemAdminComponent implements OnInit, OnChanges {
  readonly item = input.required<GalleryAdminItem>();

  readonly busy = input(false);

  readonly logoSaved = output<GalleryLogoInput>();

  readonly flyerSelected = output<File>();

  readonly imagesSelected = output<File[]>();

  readonly imageDeleted = output<string>();

  metaForm!: FormGroup;

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.metaForm = this.fb.group({
      Alt: ['', [Validators.maxLength(255)]],
      Teaser: [''],
      ShowPage: [false],
      ShowGallery: [false],
    });
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']?.currentValue && this.metaForm) {
      this.populateForm();
    }
  }

  get year(): number {
    return this.item().logo.year;
  }

  get flyerUrl(): string {
    return this.item().logo.url;
  }

  get images() {
    return this.item().album?.images ?? [];
  }

  onSave(): void {
    if (this.metaForm.valid) {
      const value = this.metaForm.value;
      this.logoSaved.emit({
        year: this.year,
        alt: value.Alt ?? '',
        teaser: value.Teaser ?? '',
        showPage: !!value.ShowPage,
        showGallery: !!value.ShowGallery,
      });
    }
  }

  onFlyerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.flyerSelected.emit(file);
    }
    input.value = '';
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length > 0) {
      this.imagesSelected.emit(files);
    }
    input.value = '';
  }

  deleteImage(url: string): void {
    this.imageDeleted.emit(url);
  }

  private populateForm(): void {
    const logo = this.item().logo;
    this.metaForm.patchValue({
      Alt: logo.alt ?? '',
      Teaser: logo.teaser ?? '',
      ShowPage: logo.showPage,
      ShowGallery: logo.showGallery,
    });
  }
}
