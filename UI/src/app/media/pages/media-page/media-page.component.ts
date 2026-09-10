import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppDataStore } from '../../../store/app-data/app-data.store';
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
  private readonly appDataStore = inject(AppDataStore);

  protected readonly activeSection = signal<MediaSection>('youtube');
  protected readonly years = signal<readonly number[]>([]);
  protected readonly galleryDefinition = this.appDataStore.galleryDefinition;

  protected scrollToSection(section: MediaSection): void {
    this.activeSection.set(section);

    const id = section === 'youtube' ? 'youtube' : `media-${section}`;

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
