import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatAnchor,
  MatButton,
  MatIconAnchor,
  MatIconButton,
} from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIcon,
    MatSidenavContainer,
    MatNavList,
    MatListItem,
    MatSidenav,
    MatToolbarModule,
    MatSidenavModule,
    MatAnchor,
    MatIconButton,
    FlexLayoutModule,
    RouterLink,
    RouterLinkActive,
    MatIconAnchor,
    MatButton,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = "Site de l'harmonie Shostakovich";

  public linkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'exact',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };

  currentYear = signal<string | null>(null);
  showMenu = signal(true);
  showBackToTop = signal(false);
  showFooter = signal(false);

  private readonly router = inject(Router);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    this.showFooter.set(true);
    this.showBackToTop.set(scrollTop > 300);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        const url = this.router.url;
        this.showMenu.set(!url.includes('/admin'));
        const sessionRouteMatch = new RegExp(/^\/session\/(\d{4})$/).exec(url);
        this.currentYear.set(sessionRouteMatch ? sessionRouteMatch[1] : null);
      });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
