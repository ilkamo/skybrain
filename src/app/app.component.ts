import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCommentDots, faEye, faEyeSlash, faUser } from '@fortawesome/free-regular-svg-icons';
import { State as RootState } from './reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from './reducers/user/user.selectors';
import { faCommentMedical, faLink } from '@fortawesome/free-solid-svg-icons';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated$ = this.store.pipe(select(UserSelectors.isAuthenticated));
  isRouteLoading$ = this.router.events.pipe(
    filter(event => event instanceof NavigationStart || event instanceof NavigationEnd ),
    map(event => event instanceof NavigationStart)
  );

  constructor(library: FaIconLibrary, private store: Store<RootState>, private router: Router) {
    library.addIcons(faEye, faEyeSlash, faUser, faCommentDots, faCommentMedical, faLink);
  }
}
