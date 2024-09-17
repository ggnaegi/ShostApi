import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {Observable} from "rxjs";
import {GalleryComponent} from "../pages/gallery.component";
import {AbstractGalleryService} from "../services/abstract.gallery.service";
import {GalleriesDefinition} from "../api/gallery";

@Component({
  selector: 'app-gallery-container',
  standalone: true,
  imports: [
    GalleryComponent,
    AsyncPipe
  ],
  template: `
    <app-gallery [galleriesDefinitions]="galleryDefinitionData$ | async"/>
  `
})
export class GalleryContainerComponent implements OnInit {
  @Output() galleryDataLoaded = new EventEmitter<boolean>();

  galleryDefinitionData$!: Observable<GalleriesDefinition>;

  constructor(public galleryService: AbstractGalleryService) {
  }

  ngOnInit(): void {
    this.galleryDefinitionData$ = this.galleryService.getGalleryDefinition$();
  }
}
