import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlCreationOptions } from '@angular/router';
import { Observable } from 'rxjs';
import { State as RootState } from '../reducers';
import { Store, select } from '@ngrx/store';
import { isAuthenticated } from '../reducers/user/user.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {
  constructor(private store: Store<RootState>, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      let extras: UrlCreationOptions;
      if (state.url !== '/') {
        extras = { queryParams: { redirect: state.url }};
      }

      return this.store.pipe(
        select(isAuthenticated),
        map(authenticated => authenticated || this.router.createUrlTree(['/login'], extras))
      );
  }
}
