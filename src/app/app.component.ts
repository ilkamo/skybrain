import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faCalendar, faClipboard, faCommentDots, faEye, faEyeSlash,
  faHeart, faUser
} from '@fortawesome/free-regular-svg-icons';
import { State as RootState } from './reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from './reducers/user/user.selectors';
import * as MemorySelectors from './reducers/memory/memory.selectors';
import {
  faCheck,
  faCommentMedical,
  faCommentSlash,
  faGlobe,
  faLink,
  faMapMarkerAlt,
  faPhotoVideo,
  faUsers,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { selectNavbarIsVisibleForRoute } from './reducers/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  navbarIsVisible$ = this.store.pipe(select(selectNavbarIsVisibleForRoute));
  userPublicKey$ = this.store.pipe(select(UserSelectors.selectUserPublicKey));

  isLoading$: Observable<boolean>;

  constructor(library: FaIconLibrary, private store: Store<RootState>, router: Router) {
    library.addIcons(
      faEye,
      faEyeSlash,
      faUser,
      faCommentDots,
      faCommentMedical,
      faLink,
      faCommentSlash,
      faGlobe,
      faMapMarkerAlt,
      faCalendar,
      faClipboard,
      faHeart,
      faPhotoVideo,
      faCheck,
      faUsers,
      faSignOutAlt,
    );

    const routeLoading$ = router.events.pipe(
      filter(event => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel),
      map(event => event instanceof NavigationStart)
    );

    this.isLoading$ = combineLatest([
      routeLoading$,
      this.store.select(UserSelectors.selectIsLoading),
      this.store.select(MemorySelectors.selectIsLoading),
    ]).pipe(
      map(([route, user, memory]) => route || user || memory),
    );
  }
}
