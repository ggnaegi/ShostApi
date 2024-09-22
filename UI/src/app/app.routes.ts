import { Routes } from '@angular/router';
import { SessionContainerComponent } from './session/containers/session.container';
import { AboutContainerComponent } from './about/containers/about.container.component';
import { SessionAdminContainerComponent } from './admin/containers/session-admin.container.component';
import { OrganisationAdminContainerComponent } from './admin/containers/organisation-admin.container.component';

export const routes: Routes = [
  { path: '', redirectTo: '/about#welcome-section', pathMatch: 'full' },
  { path: 'about', component: AboutContainerComponent }, // Main route for the AboutComponent
  { path: 'session', component: SessionContainerComponent },
  { path: 'session/:year', component: SessionContainerComponent },
  { path: 'admin', redirectTo: '/admin/sessions', pathMatch: 'full' },
  { path: 'admin/sessions', component: SessionAdminContainerComponent },
  { path: 'admin/organisation', component: OrganisationAdminContainerComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
