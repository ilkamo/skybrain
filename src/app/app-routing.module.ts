import { PublicMemoryComponent } from './pages/public-memory/public-memory.component';
import { ConnectionComponent } from './pages/connection/connection.component';
import { SharedComponent } from './pages/shared/shared.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NotAuthenticatedGuard } from './guards/not-authenticated.guard';
import { ValidProfileGuard } from './guards/valid-profile.guard';
import { ErrorComponent } from './pages/error/error.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { MemoriesComponent } from './pages/memories/memories.component';
import { MemoriesInitializedService } from './services/memories-initialized.resolver';
import { SharedMemoryService } from './services/shared-memory.resolver';
import { PublicBrainResolver } from './services/public-brain.resolver';
import { PublicMemoryService } from './services/public-memory.resolver';
import { StreamComponent } from './pages/stream/stream.component';
import { StreamResolver } from './services/stream.resolver';

export interface IBreadcrumbLink {
  title?: string;
  param?: string;
  link?: string;
}

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthenticatedGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NotAuthenticatedGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthenticatedGuard],
    data: {
      breadcrumbs: [
        {
          title: 'Profile',
          link: '/profile'
        } as IBreadcrumbLink,
      ]
    },
  },
  {
    path: 'shared/:code',
    component: SharedComponent,
    resolve: {
      sharedData: SharedMemoryService
    },
    data: {
      breadcrumbs: [
        {
          title: 'Shared',
        } as IBreadcrumbLink,
        {
          title: 'Memory',
          param: 'code',
          link: 'shared'
        } as IBreadcrumbLink,
      ]
    },
  },
  {
    path: 'public/:publicKey/:memoryId',
    component: PublicMemoryComponent,
    resolve: {
      publicData: PublicMemoryService
    },
    data: {
      breadcrumbs: [
        {
          title: 'Public Memory',
        } as IBreadcrumbLink
      ]
    },
  },
  {
    path: 'connection/:publicKey',
    component: ConnectionComponent,
    resolve: {
      publicBrain: PublicBrainResolver
    },
    data: {
      breadcrumbs: [
        {
          title: 'Connection',
        } as IBreadcrumbLink,
        {
          param: 'publicKey',
          link: 'connection'
        } as IBreadcrumbLink,
      ]
    },
  },
  {
    path: '',
    component: StreamComponent,
    resolve: {
      publicBrain: StreamResolver
    },
    data: {
      breadcrumbs: [
        {
          title: 'Stream',
          link: '/'
        } as IBreadcrumbLink,
      ]
    },
  },
  {
    path: 'memories',
    component: MemoriesComponent,
    canActivate: [AuthenticatedGuard, ValidProfileGuard],
    resolve: {
      memoriesInitialized: MemoriesInitializedService
    },
    data: {
      breadcrumbs: [
        {
          title: 'Memories',
          link: 'memories'
        } as IBreadcrumbLink,
      ]
    },
    pathMatch: 'full'
  },
  { path: '**', component: ErrorComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
