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
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatAnchor,
  MatIconAnchor,
  MatIconButton,
} from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { SessionContainerComponent } from './session/containers/session.container';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SpinnerComponent } from './spinner/pages/spinner.component';
import { filter, Subscription } from 'rxjs';
import { SpinnerService } from './spinner/services/spinner.service';

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
    MatCard,
    MatMenu,
    MatMenuItem,
    MatListItem,
    MatMenuTrigger,
    MatSidenav,
    MatToolbarModule,
    MatSidenavModule,
    MatAnchor,
    MatIconButton,
    FlexLayoutModule,
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage,
    SessionContainerComponent,
    MatIconAnchor,
    NgIf,
    MatProgressSpinner,
    SpinnerComponent,
    MatCardTitle,
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

  constructor(
    private router: Router,
    public readonly spinnerService: SpinnerService
  ) {}

  currentYear: string | null = null;
  showMenu = true;
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

        const sessionRouteMatch = url.match(/^\/session\/(\d{4})$/);
        if (sessionRouteMatch) {
          this.currentYear = sessionRouteMatch[1];
        } else {
          this.currentYear = null;
        }
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
