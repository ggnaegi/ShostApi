import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-facebook-feed',
  standalone: true,
  templateUrl: './facebook-feed.component.html',
  styleUrl: './facebook-feed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacebookFeedComponent {}
