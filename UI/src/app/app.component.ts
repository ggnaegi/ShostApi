import {AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnInit} from '@angular/core';
import {
  IsActiveMatchOptions, NavigationEnd, Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatCard, MatCardTitle} from "@angular/material/card";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatAnchor, MatIconAnchor, MatIconButton} from "@angular/material/button";
import {FlexLayoutModule} from "@angular/flex-layout";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {SessionContainerComponent} from "./session/containers/session.container";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {SpinnerComponent} from "./spinner/pages/spinner.component";
import {filter} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatSidenavContainer, MatNavList, MatCard, MatMenu, MatMenuItem, MatListItem, MatMenuTrigger, MatSidenav, MatToolbarModule, MatSidenavModule, MatAnchor, MatIconButton, FlexLayoutModule, RouterLink, RouterLinkActive, NgOptimizedImage, SessionContainerComponent, MatIconAnchor, NgIf, MatProgressSpinner, SpinnerComponent, MatCardTitle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = "Site de l'harmonie Shostakovich";

  public linkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'exact',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };

  constructor(private router: Router) {
  }

  isButtonVisible = false;
  currentYear: string | null = null;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isButtonVisible = scrollTop > 300;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (window['FB' as any]) {
        (window['FB' as any] as any).XFBML.parse();
      }
    }, 1000);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;

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
}
