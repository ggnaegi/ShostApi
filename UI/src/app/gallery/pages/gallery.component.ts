import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { GalleriesDefinition, Logo } from '../api/gallery';
import { MatDialog } from '@angular/material/dialog';
import { FlexModule } from '@angular/flex-layout';
import { Router } from '@angular/router';
import {
  MatCard,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
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
  readonly yearChanged = output<number>();

  readonly displayedLogos = computed<Logo[]>(() => {
    const definitions = this.galleriesDefinitions();
    if (!definitions?.logos?.length) {
      return [];
    }

    const logos = definitions.logos.filter(logo => logo.year >= 2020);
    return this.mediaMode()
      ? logos.filter(logo => logo.showGallery)
      : logos;
  });

  readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

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
      this.router.navigate(['/gallery', year]);
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
