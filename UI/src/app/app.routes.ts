import { Routes } from '@angular/router';
import { SessionContainerComponent } from './session/containers/session.container';
import { AboutContainerComponent } from './about/containers/about.container.component';

export const routes: Routes = [
  { path: '', redirectTo: '/about#welcome-section', pathMatch: 'full' },
  { path: 'about', component: AboutContainerComponent }, // Main route for the AboutComponent
  { path: 'session', component: SessionContainerComponent },
  { path: 'session/:year', component: SessionContainerComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
