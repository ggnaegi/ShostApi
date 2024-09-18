import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { GalleriesDefinition, Logo } from '../api/gallery';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { NgClass, NgForOf, NgIf, SlicePipe } from '@angular/common';
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

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatGridList,
    MatGridTile,
    NgForOf,
    NgIf,
    FlexModule,
    SlicePipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    MatCardActions,
    MatIcon,
    MatIconButton,
    NgClass,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnChanges {
  @Input()
  galleriesDefinitions: GalleriesDefinition | null = null;
  starredLogo: Logo | undefined = undefined;

  constructor(
    public dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setStarredGallery();
  }

  openGalleryDialog(year: number): void {
    const gallery = this.galleriesDefinitions?.galleries.find(
      (g) => g.year === year,
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
      (prev, current) => (prev.year > current.year ? prev : current),
    );
  }
}
