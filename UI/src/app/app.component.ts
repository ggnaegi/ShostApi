import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = "Site de l'harmonie Shostakovich";

  public linkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'exact',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };

  currentYear: string | null = null;
  showMenu = true;
  showFacebook = true;
  showBackToTop = false;
  showFooter = false;

  routerSubscription?: Subscription;

  private readonly router = inject(Router);
  private readonly platformId = inject<object>(PLATFORM_ID);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    this.showFooter = true;
    this.showBackToTop = scrollTop > 300;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const initialLogo = document.getElementById('initial-logo');
      if (initialLogo) {
        initialLogo.style.display = 'none';
      }
    }, 2000);
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;

        this.showMenu = !url.includes('/admin');
        const shouldShowFacebook = url.includes('/welcome');

        if (
          shouldShowFacebook &&
          !this.showFacebook &&
          isPlatformBrowser(this.platformId)
        ) {
          this.showFacebook = true;
        } else {
          this.showFacebook = shouldShowFacebook;
        }

        const sessionRouteMatch = new RegExp(/^\/session\/(\d{4})$/).exec(url);
        this.currentYear = sessionRouteMatch ? sessionRouteMatch[1] : null;
      });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
