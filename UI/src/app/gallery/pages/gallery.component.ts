import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Album, GalleriesDefinition, Logo} from "../api/gallery";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {NgForOf, NgIf, SlicePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {FlexModule} from "@angular/flex-layout";
import {MatCard, MatCardActions, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {GalleryDialogComponent} from "./gallery-dialog/gallery-dialog.component";

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
    MatIconButton
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnChanges {
  @Input()
  galleriesDefinitions: GalleriesDefinition | null = null;

  constructor(public dialog: MatDialog) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['galleriesDefinitions'] && this.galleriesDefinitions) {
      if(!this.galleriesDefinitions) {
        return;
      }

      this.galleriesDefinitions.logos = this.galleriesDefinitions.logos.sort((a: Logo, b: Logo) => a.year - b.year)
      this.galleriesDefinitions.galleries = this.galleriesDefinitions.galleries.sort((a: Album, b: Album) => a.year - b.year);
    }
  }

  // Helper function to get the logo URL for the corresponding year
  getLogoForYear(year: number): string {
    const logo = this.galleriesDefinitions?.logos.find(l => l.year === year);
    return logo ? logo.url : '';
  }

  // Helper function to get the alt text for the corresponding year
  getAltForYear(year: number): string {
    const logo = this.galleriesDefinitions?.logos.find(l => l.year === year);
    return logo ? logo.alt : '';
  }

  openGalleryDialog(gallery: Album): void {
    this.dialog.open(GalleryDialogComponent, {
      data: gallery,
      width: '90vw',
      height: '90vh'
    });
  }
}
