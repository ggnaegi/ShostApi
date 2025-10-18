import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AboutPageDto } from '../../api/layout.models';
import { NgForOf, NgIf } from '@angular/common';
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
  standalone: true,
  imports: [
    NgIf,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    FlexModule,
    MatCardContent,
    NgForOf,
    MatTooltip,
    RouterLink,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  @Input()
  data: AboutPageDto | null = null;
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
