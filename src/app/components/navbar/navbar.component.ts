import { Component, OnInit } from '@angular/core';
import { State as RootState } from './../../reducers';
import * as UserSelectors from './../../reducers/user/user.selectors';
import { Store, select } from '@ngrx/store';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuthenticated$ = this.store.pipe(select(UserSelectors.isAuthenticated));
  opened = false;

  constructor(private store: Store<RootState>) {}

  ngOnInit(): void {
  }

}
