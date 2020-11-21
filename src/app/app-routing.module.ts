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

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [ NotAuthenticatedGuard ]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [ NotAuthenticatedGuard ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthenticatedGuard ],
  },
  {
    path: 'shared/:code',
    component: SharedComponent,
    resolve: {
      sharedData: SharedMemoryService
    }
  },
  {
    path: 'connection/:publicKey',
    component: ConnectionComponent,
    resolve: {
      publicBrain: PublicBrainResolver
    }
  },
  {
    path: '',
    component: MemoriesComponent,
    canActivate: [ AuthenticatedGuard, ValidProfileGuard ],
    resolve: {
      memoriesInitialized: MemoriesInitializedService
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
