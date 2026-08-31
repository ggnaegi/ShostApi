import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { AboutPageDto } from '../../api/layout.models';

import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    FlexModule,
    MatCardContent,
    MatTooltip,
    RouterLink,
  ],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  readonly data = input<AboutPageDto | null>(null);
  activeSection: 'band' | 'committee' = 'band';
  isFloatingMenuVisible = false;
  isMobile = false;

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isFloatingMenuVisible = window.scrollY > 200;

    const bandSection = document.getElementById('band');
    const committeeSection = document.getElementById('committee');

    if (bandSection && committeeSection) {
      const scrollPosition = window.scrollY + 300;
      const committeeTop = committeeSection.offsetTop;

      this.activeSection =
        scrollPosition >= committeeTop ? 'committee' : 'band';
    }
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
  }
}
