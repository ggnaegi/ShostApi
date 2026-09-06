import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { WelcomePageDto } from '../../api/layout.models';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageWithLoadingComponent } from '../../../common/image-with-loading.component';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatButton } from '@angular/material/button';
import {
  faBuilding,
  faCalendarAlt,
  faMapMarkerAlt,
  faTicket,
} from '@fortawesome/free-solid-svg-icons';

interface YouTubeVideoSummary {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}

// Uploads playlist of the Harmonie Shostakovich YouTube channel.
// The channel ID is UCll6YfS1FhbiK52QKGBfoRg; swapping "UC" for "UU" yields the uploads playlist.
const YOUTUBE_CHANNEL_ID = 'UCll6YfS1FhbiK52QKGBfoRg';
const YOUTUBE_UPLOADS_PLAYLIST_ID = 'UUll6YfS1FhbiK52QKGBfoRg';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@harmonieshostakovich8006';

@Component({
  selector: 'app-welcome',
  imports: [
    ImageWithLoadingComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    DatePipe,
    FaIconComponent,
    MatButton,
    MatCardContent,
  ],
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit {
  readonly data = input<WelcomePageDto | null>(null);

  year = 2026;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faMapMarkerAlt = faMapMarkerAlt;
  protected readonly faBuilding = faBuilding;
  protected readonly faTicket = faTicket;

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly youtubeChannelUrl = YOUTUBE_CHANNEL_URL;
  protected readonly youtubeVideos: YouTubeVideoSummary[] = [];
  protected selectedVideoId: string | null = null;

  protected readonly youtubeEmbedUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST_ID}&rel=0&modestbranding=1&playsinline=1`
    );

  ngOnInit(): void {
    void this.loadLatestVideos();
  }

  protected selectVideo(videoId: string): void {
    this.selectedVideoId = videoId;
  }

  protected get selectedEmbedUrl(): SafeResourceUrl {
    const videoId = this.selectedVideoId ?? this.youtubeVideos[0]?.id;
    if (!videoId) {
      return this.youtubeEmbedUrl;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
    );
  }

  private async loadLatestVideos(): Promise<void> {
    try {
      const response = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`
      );

      if (!response.ok) {
        return;
      }

      const xml = await response.text();
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const entries = Array.from(doc.querySelectorAll('entry')).slice(0, 3);

      this.youtubeVideos.length = 0;
      for (const entry of entries) {
        const title = entry.querySelector('title')?.textContent?.trim() ?? 'YouTube video';
        const videoLink = entry.querySelector('link[rel="alternate"]')?.getAttribute('href');
        const videoId = videoLink?.match(/[?&]v=([^&]+)/)?.[1] ?? '';

        if (!videoId) {
          continue;
        }

        this.youtubeVideos.push({
          id: videoId,
          title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        });
      }

      if (!this.selectedVideoId && this.youtubeVideos[0]) {
        this.selectedVideoId = this.youtubeVideos[0].id;
      }
    } catch {
      this.youtubeVideos.length = 0;
    }
  }
}
