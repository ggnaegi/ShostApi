import {
  Component,
  HostListener,
  inject,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Album } from '../../api/gallery';

import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-gallery-dialog',
  templateUrl: './gallery-dialog.component.html',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatDialogClose,
    MatPaginator,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./gallery-dialog.component.css'],
})
export class GalleryDialogComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentIndex = 0;
  isMobile = false;

  public data = inject<Album>(MAT_DIALOG_DATA);

  constructor() {
    this.checkScreenWidth();
  }
  ngAfterViewInit() {
    if (!this.paginator) {
      return;
    }

    this.paginator.page.subscribe({
      next: () => {
        this.currentIndex = this.paginator ? this.paginator.pageIndex : 0; // Update the current index on page change
      },
    });
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenWidth();
  }

  checkScreenWidth(): void {
    this.isMobile = window.innerWidth < 768; // Check if the screen width is less than 768px
  }
}
