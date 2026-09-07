import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type MediaSection = 'youtube' | string;

@Component({
  selector: 'app-media-navigation',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './media-navigation.component.html',
  styleUrls: ['./media-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaNavigationComponent {
  readonly years = input.required<readonly number[]>();
  readonly activeSection = input<MediaSection>('youtube');

  readonly navigate = output<MediaSection>();

  protected onSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.navigate.emit(select.value);
  }
}
