import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

interface YouTubeVideoSummary {
  Id: string;
  Title: string;
  Url: string;
  Thumbnail: string;
}

interface YoutubeFeedApiResponse {
  items: YouTubeVideoSummary[];
  fetchedAt?: string;
}

// Uploads playlist of the Harmonie Shostakovich YouTube channel.
// The channel ID is UCll6YfS1FhbiK52QKGBfoRg; swapping "UC" for "UU" yields the uploads playlist.
const YOUTUBE_UPLOADS_PLAYLIST_ID = 'UUll6YfS1FhbiK52QKGBfoRg';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@harmonieshostakovich8006';
const MAX_THUMBNAILS = 4;

@Component({
  selector: 'app-youtube-videos',
  standalone: true,
  imports: [],
  templateUrl: './youtube-videos.component.html',
  styleUrl: './youtube-videos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubeVideosComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);

  readonly vertical = input(false);
  readonly maxThumbnails = input(MAX_THUMBNAILS);

  protected readonly youtubeChannelUrl = YOUTUBE_CHANNEL_URL;
  protected readonly youtubeVideos = signal<YouTubeVideoSummary[]>([]);
  protected readonly selectedVideoId = signal<string | null>(null);

  private readonly fallbackEmbedUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST_ID}&rel=0&modestbranding=1&playsinline=1`
    );

  ngOnInit(): void {
    this.loadLatestVideos();
  }

  protected selectVideo(videoId: string): void {
    this.selectedVideoId.set(videoId);
  }

  protected get selectedEmbedUrl(): SafeResourceUrl {
    const videoId = this.selectedVideoId() ?? this.youtubeVideos()[0]?.Id;
    if (!videoId) {
      return this.fallbackEmbedUrl;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
    );
  }

  private loadLatestVideos(): void {
    this.http
      .get<YoutubeFeedApiResponse>(environment.youtubeFeedEndpointUrl)
      .subscribe({
        next: response => {
          const videos = (response?.items ?? []).slice(0, this.maxThumbnails());
          this.youtubeVideos.set(videos);

          if (!this.selectedVideoId() && videos[0]) {
            this.selectedVideoId.set(videos[0].Id);
          }
        },
        error: () => {
          this.youtubeVideos.set([]);
        },
      });
  }
}
