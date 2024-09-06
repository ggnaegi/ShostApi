import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatCard} from "@angular/material/card";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatAnchor, MatIconButton} from "@angular/material/button";
import {FlexLayoutModule} from "@angular/flex-layout";
import {NgOptimizedImage} from "@angular/common";
import {SessionContainerComponent} from "./session/containers/session.container";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatSidenavContainer, MatNavList, MatCard, MatMenu, MatMenuItem, MatListItem, MatMenuTrigger, MatSidenav, MatToolbarModule, MatSidenavModule, MatAnchor, MatIconButton, FlexLayoutModule, RouterLink, RouterLinkActive, NgOptimizedImage, SessionContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = "Site de l'harmonie Shostakovich";
}
