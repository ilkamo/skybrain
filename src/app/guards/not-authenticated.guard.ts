import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { State as RootState } from '../reducers';
import { Store, select } from '@ngrx/store';
import { isAuthenticated } from '../reducers/user/user.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotAuthenticatedGuard implements CanActivate {
  constructor(private store: Store<RootState>, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      return this.store.pipe(
        select(isAuthenticated),
        map(authenticated => !authenticated || this.router.createUrlTree(['/memories']))
      );
  }
}
