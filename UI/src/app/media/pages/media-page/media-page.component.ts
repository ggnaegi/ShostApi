import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryContainerComponent } from '../../../gallery/container/gallery.container.component';
import { YoutubeVideosComponent } from '../../../layout/components/youtube-videos/youtube-videos.component';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [GalleryContainerComponent, YoutubeVideosComponent],
  templateUrl: './media-page.component.html',
  styleUrl: './media-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPageComponent {}
