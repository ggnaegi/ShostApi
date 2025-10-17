import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
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
import { RouterLink } from '@angular/router';
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
    RouterLink,
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
  welcomeMessage: string = '';
  @Input()
  galleriesDefinitions: GalleriesDefinition | null = null;
  starredLogo: Logo | undefined = undefined;

  constructor(public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setStarredGallery();
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

  private setStarredGallery(): void {
    if (!this.galleriesDefinitions?.logos) {
      return;
    }

    this.starredLogo = this.galleriesDefinitions?.logos.reduce(
      (prev, current) => (prev.year > current.year ? prev : current)
    );
  }
}
