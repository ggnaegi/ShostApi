import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { GalleryComponent } from '../pages/gallery.component';
import { AbstractGalleryService } from '../services/abstract.gallery.service';

@Component({
  selector: 'app-gallery-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GalleryComponent, AsyncPipe],
  template: `
    <app-gallery
      [galleriesDefinitions]="galleryService.getGalleryDefinition$() | async"
      [welcomeMessage]="welcomeMessage" />
  `,
})
export class GalleryContainerComponent {
  @Input() welcomeMessage: string = '';
  @Output() galleryDataLoaded = new EventEmitter<boolean>();
  constructor(public readonly galleryService: AbstractGalleryService) {}
}
