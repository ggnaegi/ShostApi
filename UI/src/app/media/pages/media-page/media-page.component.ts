import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GalleryContainerComponent } from '../../../gallery/container/gallery.container.component';
import { YoutubeVideosComponent } from '../../../layout/components/youtube-videos/youtube-videos.component';
import {
  MediaNavigationComponent,
  MediaSection,
} from '../../components/media-navigation.component';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [
    GalleryContainerComponent,
    YoutubeVideosComponent,
    MediaNavigationComponent,
  ],
  templateUrl: './media-page.component.html',
  styleUrls: ['./media-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPageComponent {
  protected readonly activeSection = signal<MediaSection>('youtube');
  protected readonly years = signal<readonly number[]>([]);

  protected scrollToSection(section: MediaSection): void {
    this.activeSection.set(section);

    const id = section === 'youtube' ? 'youtube' : `media-${section}`;

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
