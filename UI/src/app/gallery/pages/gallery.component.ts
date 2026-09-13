import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GalleriesDefinition, Logo } from '../api/gallery';
import { MatDialog } from '@angular/material/dialog';
import { FlexModule } from '@angular/flex-layout';
import { Router, RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { GalleryDialogComponent } from './gallery-dialog/gallery-dialog.component';
import { ImageWithLoadingComponent } from '../../common/image-with-loading.component';

@Component({
  selector: 'app-gallery',
  imports: [
    FlexModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatIcon,
    MatIconButton,
    RouterLink,
    ImageWithLoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  readonly welcomeMessage = input('');
  readonly galleriesDefinitions = input<GalleriesDefinition | null>(null);
  readonly mediaMode = input(false);
  readonly carouselMode = input(false);
  readonly yearChanged = output<number>();
  private readonly carouselPage = signal(0);
  private readonly carouselPageSize = 6;

  constructor() {
    // The self-hosted "Material Icons Outlined" font is a subset that lacks the
    // photo_library glyph, so register it as an SVG icon to guarantee it renders.
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIconLiteral(
      'photo-library',
      sanitizer.bypassSecurityTrustHtml(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
          '<path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>' +
          '</svg>'
      )
    );
  }

  readonly displayedLogos = computed<Logo[]>(() => {
    const definitions = this.galleriesDefinitions();
    if (!definitions?.logos?.length) {
      return [];
    }

    const logos = [...definitions.logos]
      .filter(logo => !this.carouselMode() || logo.showOnCarousel)
      .sort((a, b) => b.year - a.year);

    if (this.mediaMode()) {
      return logos.filter(logo => logo.showGallery);
    }

    if (this.carouselMode()) {
      const start = this.activeCarouselPage() * this.carouselPageSize;
      return logos.slice(start, start + this.carouselPageSize);
    }

    return logos.slice(0, this.carouselPageSize);
  });

  readonly hasPreviousCarouselPage = computed(() => this.carouselPage() > 0);
  readonly hasNextCarouselPage = computed(() => {
    const totalLogos = this.carouselLogos().length;
    return (
      (this.activeCarouselPage() + 1) * this.carouselPageSize < totalLogos
    );
  });

  readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  previousCarouselPage(): void {
    this.carouselPage.update(page => Math.max(0, page - 1));
  }

  nextCarouselPage(): void {
    if (this.hasNextCarouselPage()) {
      this.carouselPage.update(page => page + 1);
    }
  }

  private activeCarouselPage(): number {
    const totalLogos = this.carouselLogos().length;
    return Math.min(
      this.carouselPage(),
      Math.max(0, Math.ceil(totalLogos / this.carouselPageSize) - 1)
    );
  }

  private carouselLogos(): Logo[] {
    return (this.galleriesDefinitions()?.logos ?? []).filter(
      logo => logo.showOnCarousel
    );
  }

  onCardClick(logo: Logo): void {
    if (this.mediaMode()) {
      if (logo.showGallery) {
        this.openGalleryDialog(logo.year);
      }
      return;
    }

    this.onYearClick(logo.showPage, logo.year);
  }

  onYearClick(showPage: boolean, year: number): void {
    if (!showPage) {
      return;
    }
    this.yearChanged.emit(year);
  }

  openGalleryDialog(year: number): void {
    const gallery = this.galleriesDefinitions()?.galleries.find(
      g => g.year === year
    );

    if (!gallery) {
      return;
    }

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      void this.router.navigate(['/gallery', year]);
      return;
    }

    this.dialog.open(GalleryDialogComponent, {
      panelClass: 'responsive-gallery-dialog',
      disableClose: false,
      autoFocus: false,
      maxWidth: '100vw',
      width: 'min(1200px, 92vw)',
      height: 'min(85vh, 820px)',
      maxHeight: '85vh',
      data: gallery,
    });
  }
}
