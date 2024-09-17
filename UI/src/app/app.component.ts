import {AfterViewInit, ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {
  IsActiveMatchOptions,
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

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatSidenavContainer, MatNavList, MatCard, MatMenu, MatMenuItem, MatListItem, MatMenuTrigger, MatSidenav, MatToolbarModule, MatSidenavModule, MatAnchor, MatIconButton, FlexLayoutModule, RouterLink, RouterLinkActive, NgOptimizedImage, SessionContainerComponent, MatIconAnchor, NgIf, MatProgressSpinner, SpinnerComponent, MatCardTitle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = "Site de l'harmonie Shostakovich";

  public linkActiveOptions: IsActiveMatchOptions = {
    matrixParams: 'exact',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };

  constructor() {
  }

  isButtonVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isButtonVisible = scrollTop > 300; // Show button when scrolled 300px down
  }

  ngAfterViewInit() {
    // Use a delay to ensure the Facebook SDK has loaded
    setTimeout(() => {
      if (window['FB' as any]) {
        (window['FB' as any] as any).XFBML.parse();
      }
    }, 1000);  // A 1-second delay should be sufficient
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
