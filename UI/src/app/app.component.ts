import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
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
import { AsyncPipe, NgIf } from '@angular/common';
import { SpinnerComponent } from './spinner/pages/spinner.component';
import { filter, Subscription } from 'rxjs';
import { SpinnerService } from './spinner/services/spinner.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

declare global {
  interface Window {
    FB: any; // More specific types can be used if available
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
    SpinnerComponent,
    AsyncPipe,
    MatProgressSpinner,
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

  constructor(
    private router: Router,
    public readonly spinnerService: SpinnerService
  ) {}

  currentYear: string | null = null;
  showMenu = true;
  showFacebook = true;
  showBackToTop = false;
  showFooter = false;

  routerSubscription?: Subscription;
  appRefSubscription?: Subscription;

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
        this.showFacebook = url.includes('/about');

        const sessionRouteMatch = url.match(/^\/session\/(\d{4})$/);
        if (sessionRouteMatch) {
          this.currentYear = sessionRouteMatch[1];
        } else {
          this.currentYear = null;
        }
      });
    this.loadScript();
  }

  private loadScript() {
    // Check if FB is already loaded to avoid loading it multiple times
    if (window.FB) {
      this.initFB();
      return;
    }

    const node = document.createElement('script');
    node.src = 'https://connect.facebook.net/fr_FR/sdk.js'; // Adjust the URL to your needs
    node.type = 'text/javascript';
    node.async = true;
    node.onload = () => this.initFB();
    document.getElementsByTagName('head')[0].appendChild(node);
  }


  /*
  <script
    async
    defer
    crossorigin="anonymous"
    src="https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v21.0"></script>
   */
  private initFB() {
    // Initialize the Facebook SDK
    window.FB.init({
      appId      : 'harmonieshosta', // Replace with your actual Facebook App ID
      cookie     : false,
      xfbml      : true,
      version    : 'v21.0' // Use the appropriate Facebook SDK version
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.appRefSubscription) {
      this.appRefSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
