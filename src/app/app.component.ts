import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { State as RootState } from './reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from './reducers/user/user.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated$ = this.store.pipe(select(UserSelectors.isAuthenticated));
  constructor(library: FaIconLibrary, private store: Store<RootState>) {
    library.addIcons(faEye, faEyeSlash);
  }
}
