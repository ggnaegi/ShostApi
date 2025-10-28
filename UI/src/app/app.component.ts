import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatAnchor,
  MatIconAnchor,
  MatIconButton,
} from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgIf } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { SpinnerService } from './spinner/services/spinner.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
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
    NgIf,
    MatProgressSpinner,
    AsyncPipe,
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

  constructor(
    private router: Router,
    public readonly spinnerService: SpinnerService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

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

        const sessionRouteMatch = url.match(/^\/session\/(\d{4})$/);
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
