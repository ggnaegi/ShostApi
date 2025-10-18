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
import { isPlatformBrowser } from '@angular/common';
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
import { SpinnerComponent } from './spinner/pages/spinner.component';
import { filter, Subscription } from 'rxjs';
import { SpinnerService } from './spinner/services/spinner.service';

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      XFBML: { parse: (element?: HTMLElement) => void };
    };
    fbAsyncInit?: () => void;
  }
}

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
  private fbInitialized = false;

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

        if (shouldShowFacebook && !this.showFacebook && isPlatformBrowser(this.platformId)) {
          this.showFacebook = true;
          setTimeout(() => this.reloadFacebookWidget(), 300);
        } else {
          this.showFacebook = shouldShowFacebook;
        }

        const sessionRouteMatch = url.match(/^\/session\/(\d{4})$/);
        this.currentYear = sessionRouteMatch ? sessionRouteMatch[1] : null;
      });

    if (isPlatformBrowser(this.platformId)) {
      this.loadFacebookSDK();
    }
  }

  private loadFacebookSDK() {
    if (this.fbInitialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }

    const fbRoot = document.getElementById('fb-root');
    if (!fbRoot) {
      const div = document.createElement('div');
      div.id = 'fb-root';
      document.body.insertBefore(div, document.body.firstChild);
    }

    window.fbAsyncInit = () => {
      if (window.FB) {
        window.FB.init({
          xfbml: true,
          version: 'v21.0',
        });
        this.fbInitialized = true;
      }
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      console.warn('Facebook SDK failed to load');
      this.showFacebook = false;
    };
    document.body.appendChild(script);
  }

  private reloadFacebookWidget() {
    if (window.FB && this.fbInitialized) {
      const fbContainer = document.querySelector('.fb-page');
      if (fbContainer) {
        window.FB.XFBML.parse(fbContainer.parentElement || undefined);
      }
    }
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
