import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NotAuthenticatedGuard } from './guards/not-authenticated.guard';
import { ValidProfileGuard } from './guards/valid-profile.guard';
import { ErrorComponent } from './pages/error/error.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { WallComponent } from './pages/wall/wall.component';

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
    path: '',
    component: WallComponent,
    canActivate: [ AuthenticatedGuard, ValidProfileGuard ],
    pathMatch: 'full'
  },
  { path: '**', component: ErrorComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
