import { Routes } from '@angular/router';
import { SessionContainerComponent } from './session/containers/session.container';
import { SessionAdminContainerComponent } from './admin/containers/session-admin.container.component';
import { OrganisationAdminContainerComponent } from './admin/containers/organisation-admin.container.component';
import { WelcomeContainerComponent } from './layout/containers/welcome.container';
import { AboutContainerComponent } from './layout/containers/about.container';

export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeContainerComponent }, // Main route for the AboutComponent
  { path: 'about', component: AboutContainerComponent },
  { path: 'session/:year', component: SessionContainerComponent },
  { path: 'admin', redirectTo: '/admin/sessions', pathMatch: 'full' },
  { path: 'admin/sessions', component: SessionAdminContainerComponent },
  { path: 'admin/organisation', component: OrganisationAdminContainerComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
