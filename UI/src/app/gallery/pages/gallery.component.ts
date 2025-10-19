import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { GalleriesDefinition, Logo } from '../api/gallery';
import { NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FlexModule } from '@angular/flex-layout';
import {
  MatCard,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { GalleryDialogComponent } from './gallery-dialog/gallery-dialog.component';
import { ImageWithLoadingComponent } from '../../common/image-with-loading.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FlexModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatIcon,
    MatIconButton,
    ImageWithLoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnChanges {
  @Input()
  welcomeMessage = '';
  @Input()
  galleriesDefinitions: GalleriesDefinition | null = null;
  @Output()
  yearChanged = new EventEmitter<number>();

  starredLogo: Logo | undefined = undefined;

  constructor(public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setStarredGallery();
  }

  onYearClick(showPage: boolean, year: number) {
    if (!showPage) {
      return;
    }
    this.yearChanged.emit(year);
  }

  openGalleryDialog(year: number): void {
    const gallery = this.galleriesDefinitions?.galleries.find(
      g => g.year === year
    );

    if (!gallery) {
      return;
    }

    this.dialog.open(GalleryDialogComponent, {
      panelClass: 'fullscreen-dialog',
      disableClose: false,
      autoFocus: false,
      data: gallery,
    });
  }

  selectedLogo: Logo | undefined;

  // call this on card click to mark selection
  selectLogo(logo: Logo): void {
    this.selectedLogo = logo;
  }

  // helper used by template
  isSelected(logo: Logo): boolean {
    return logo === this.selectedLogo || logo === this.starredLogo;
  }

  private setStarredGallery(): void {
    if (!this.galleriesDefinitions?.logos) {
      return;
    }

    this.starredLogo = this.galleriesDefinitions?.logos.reduce(
      (prev, current) => (prev.year > current.year ? prev : current)
    );
  }
}
