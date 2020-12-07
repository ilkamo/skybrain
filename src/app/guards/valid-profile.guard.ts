import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlCreationOptions } from '@angular/router';
import { Observable } from 'rxjs';
import { State as RootState } from '../reducers';
import { Store, select } from '@ngrx/store';
import { hasValidUserData } from '../reducers/user/user.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValidProfileGuard implements CanActivate {
  constructor(private store: Store<RootState>, private router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
      let extras: UrlCreationOptions;
      if (state.root.queryParamMap.get('redirect')) {
        extras = { queryParams: { redirect: state.root.queryParamMap.get('redirect') }};
      }
      return this.store.pipe(
        select(hasValidUserData),
        map(valid => valid || this.router.createUrlTree(['/profile'], extras))
      );
  }
}
