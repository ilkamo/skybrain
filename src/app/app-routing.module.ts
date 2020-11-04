import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NotAuthenticatedGuard } from './guards/not-authenticated.guard';
import { ErrorComponent } from './pages/error/error.component';
import { LoginComponent } from './pages/login/login.component';
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
  },
  {
    path: '',
    component: WallComponent,
    canActivate: [ AuthenticatedGuard ],
    pathMatch: 'full'
  },
  { path: '**', component: ErrorComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
